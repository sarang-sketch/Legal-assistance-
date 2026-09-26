output "cloud_run_url" {
  description = "The deployed URL of JustitiaAI on Google Cloud Run"
  value       = google_cloud_run_v2_service.api_gateway.uri
}

output "storage_vault_bucket" {
  description = "Encrypted evidence vault bucket name"
  value       = google_storage_bucket.legal_vault.name
}

output "bigquery_dataset_id" {
  description = "Regulatory compliance BigQuery dataset"
  value       = google_bigquery_dataset.legal_ops.dataset_id
}
