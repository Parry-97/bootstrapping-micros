resource "azurerm_kubernetes_cluster" "cluster" {
  name                = var.app_name
  location            = var.location
  resource_group_name = azurerm_resource_group.flixtube.name
  dns_prefix          = var.app_name
  kubernetes_version  = var.kubernetes_version

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }
}

/* NOTE: We must “attach” our container registry to our cluster so that our cluster is pre-authenticated to pull images from it.  
 * Here is what each attribute in the role assignment resource represents: */
/* - `principal_id`: The object ID of the Kubernetes cluster's kubelet identity. */
/* - `role_definition_name`: The name of the role definition to assign. In this case, it is "AcrPull",
 *    which grants the ability to pull images from the Azure Container Registry. */
/* - `scope`: The ID of the Azure Container Registry resource to which the role assignment applies. */
/* - `skip_service_principal_aad_check`: A boolean value that indicates whether to 
 *    skip the Azure Active Directory (AAD) check for the service principal. In this case, it is set to true. */

resource "azurerm_role_assignment" "role_assignment" {
  /* In this case we only have a single node in pool, so we can use the first element of the kubelet_identity array. */
  principal_id                     = azurerm_kubernetes_cluster.cluster.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.container_registry.id
  skip_service_principal_aad_check = true
}

/* NOTE: A kubelet is an agent that runs on each node in a Kubernetes cluster. 
 * It is responsible for managing the state of the node, including starting and 
 * stopping containers, monitoring their health, and reporting back to the Kubernetes API server.
 * The kubelet also ensures that the containers running on the node are in sync with the desired
 * state specified by the Kubernetes control plane.
 * -------------------------------------------------------------------------------- 
 * By default, a Kubernetes cluster has one kubelet per node. The kubelet is responsible for managing the state 
 * of the node and ensuring that the containers running on the node are in sync with the 
 * desired state specified by the Kubernetes control plane. However, it is possible 
 * to run multiple kubelets on a single node using virtualization or containerization
 * techniques, although this is not a common practice. 
 * --------------------------------------------------------------------------------
 * By default, a Kubernetes cluster does not have any node pools. Node pools are a feature 
 * of managed Kubernetes services, such as Azure Kubernetes Service (AKS),
 * that allow you to create and manage groups of nodes with different
 * configurations and capacities. In these services, a default node pool is usually
 * created when you create a new cluster, but this may vary depending on the provider
 * and the configuration options chosen. However, if you are setting up your own
 * Kubernetes cluster, you will need to create and manage node pools manually
 * using tools such as kubeadm or Terraform.
 * */
