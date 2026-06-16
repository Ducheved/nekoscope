terraform {
  required_version = ">= 1.6.0"
}

variable "region" {
  type    = string
  default = "local"
}

resource "null_resource" "nekoscope_docs" {
  triggers = {
    region = var.region
  }
}

output "workspace" {
  value = "neko-repo"
}
