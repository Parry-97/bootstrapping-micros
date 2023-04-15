# NOTE: The "container_registry" string after the Terraform resource type "azurerm_container_registry" 
# is the name of the resource block. It is used to uniquely identify this resource 
# block within the Terraform configuration and can be referenced by other resources.
# In this case, it is named "container_registry".
# --------------------------------------------------------------------------------

resource "azurerm_container_registry" "container_registry" {
  name                = var.container_registry_name
  resource_group_name = azurerm_resource_group.flixtube.name
  location            = var.location
  sku                 = "Basic"
  admin_enabled       = true
}


# INFO: Take note of how the value of resource_group_name is set from the properties 
# of a resource that is defined in another file. These two resources are now linked via the Terraform resource graph. 
# This is how Terraform manages the dependencies between resources. 
# It’s how Terraform knows the order in which it should execute our script files. 
# This link is how Terraform knows it must create the resource group before it 
# creates the container registry.esources or modules.
#
# WARN: Use Terraform outputs only for debugging and understanding the infrastructure Terraform has created. 
# We can retrieve the credentials from the Azure Portal or the Azure CLI without saving them in our Terraform state file.

/* output "registry_hostname" { */
/*   value = azurerm_container_registry.container_registry.login_server */
/* } */
/**/
/* output "registry_un" { */
/*   value = azurerm_container_registry.container_registry.admin_username */
/* } */
/**/
/* output "registry_pw" { */
/*   value     = azurerm_container_registry.container_registry.admin_password */
/*   sensitive = true */
/* } */

#NOTE: We can use Terraform outputs to extract generated configuration details from our Terraform code. 
#you can see outputs declared to output the URL, username and password for our new container registry. 
#This causes Terraform to display these values in the terminal.
