variable "project_id" {
  description = "The Google Cloud Platform Project ID"
  type        = string
  default     = "justitia-legal-ai-prod"
}

variable "region" {
  description = "The primary Google Cloud region for deployments"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "Name of the Cloud Run microservice"
  type        = string
  default     = "justitia-api-gateway"
}

variable "container_image" {
  description = "Container image URI in Google Artifact Registry"
  type        = string
  default     = "us-central1-docker.pkg.dev/justitia-legal-ai-prod/justitia-repo/api:v1.0.0"
}
