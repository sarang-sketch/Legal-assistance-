terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.30.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Enable Required GCP APIs
resource "google_project_service" "enabled_apis" {
  for_each = toset([
    "aiplatform.googleapis.com",
    "documentai.googleapis.com",
    "run.googleapis.com",
    "storage.googleapis.com",
    "bigquery.googleapis.com",
    "translate.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
  ])
  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

# 2. Service Account for JustitiaAI Microservices
resource "google_service_account" "justitia_runner" {
  account_id   = "justitia-cloudrun-sa"
  display_name = "JustitiaAI Cloud Run Execution Service Account"
}

# 3. Google Cloud Storage Encrypted Legal Vault
resource "google_storage_bucket" "legal_vault" {
  name                        = "${var.project_id}-evidence-vault"
  location                    = "US"
  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }
  lifecycle_rule {
    action {
      type = "SetStorageClass"
      storage_class = "COLDLINE"
    }
    condition {
      age = 90
    }
  }
}

# 4. BigQuery Analytics & Regulatory Audit Dataset
resource "google_bigquery_dataset" "legal_ops" {
  dataset_id                  = "justitia_legal_ops"
  friendly_name               = "Justitia Legal Operations & Audit Dataset"
  description                 = "Immutable regulatory audit trail and pro-bono access telemetry"
  location                    = "US"
  default_table_expiration_ms = 31536000000 # 1 year retention
}

resource "google_bigquery_table" "audit_logs" {
  dataset_id = google_bigquery_dataset.legal_ops.dataset_id
  table_id   = "access_audit_logs"

  time_partitioning {
    type  = "DAY"
    field = "timestamp"
  }

  schema = <<EOF
[
  {"name": "event_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "timestamp", "type": "TIMESTAMP", "mode": "REQUIRED"},
  {"name": "user_uid", "type": "STRING", "mode": "REQUIRED"},
  {"name": "user_role", "type": "STRING", "mode": "REQUIRED"},
  {"name": "action_type", "type": "STRING", "mode": "REQUIRED"},
  {"name": "resource_id", "type": "STRING", "mode": "NULLABLE"},
  {"name": "jurisdiction", "type": "STRING", "mode": "NULLABLE"},
  {"name": "model_version", "type": "STRING", "mode": "REQUIRED"},
  {"name": "token_usage_prompt", "type": "INTEGER", "mode": "NULLABLE"},
  {"name": "token_usage_completion", "type": "INTEGER", "mode": "NULLABLE"},
  {"name": "latency_ms", "type": "FLOAT", "mode": "NULLABLE"},
  {"name": "client_ip_anonymized", "type": "STRING", "mode": "NULLABLE"},
  {"name": "metadata_json", "type": "STRING", "mode": "NULLABLE"}
]
EOF
}

# 5. Cloud Run Serverless Microservice
resource "google_cloud_run_v2_service" "api_gateway" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.justitia_runner.email
    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }
    containers {
      image = var.container_image
      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
      }
      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "GCP_REGION"
        value = var.region
      }
      env {
        name  = "SIMULATION_MODE"
        value = "false"
      }
    }
  }

  depends_on = [google_project_service.enabled_apis]
}

# 6. IAM Policy Bindings
resource "google_project_iam_member" "vertex_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.justitia_runner.email}"
}

resource "google_project_iam_member" "docai_user" {
  project = var.project_id
  role    = "roles/documentai.apiUser"
  member  = "serviceAccount:${google_service_account.justitia_runner.email}"
}

resource "google_project_iam_member" "bq_editor" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.justitia_runner.email}"
}

resource "google_project_iam_member" "gcs_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.justitia_runner.email}"
}
