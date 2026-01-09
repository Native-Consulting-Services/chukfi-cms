package permissions

type Permission uint32

// permission errors

// permissions
const (
	ViewDashboard Permission = 1 << iota

	ViewModels
	ViewUsers

	ManageUsers
	ManageModels

	Administrator
)

// Predefined permission sets
var (
	BasicUser = ViewDashboard | ViewModels | ViewUsers
	Admin     = Administrator
)

// haspermission

func HasPermission(userPermissions, requiredPermissions Permission) bool {
	// if permission is Administrator, grant all permissions
	if userPermissions&Administrator == Administrator {
		return true
	}
	return userPermissions&requiredPermissions == requiredPermissions
}

func AllPermissionsAsStrings() []string {
	permissions := []Permission{
		ViewDashboard,
		Administrator,
		ViewModels,
		ViewUsers,
		ManageUsers,
		ManageModels,
	}

	var permissionNames []string
	for _, perm := range permissions {
		permissionNames = append(permissionNames, PermissionToName(perm))
	}
	return permissionNames
}

func PermissionsToStrings(userPermissions Permission) []string {
	var permissionNames []string
	permissions := []Permission{
		ViewDashboard,
		Administrator,
		ViewModels,
		ViewUsers,
		ManageUsers,
		ManageModels,
	}
	for _, perm := range permissions {
		if HasPermission(userPermissions, perm) {
			permissionNames = append(permissionNames, PermissionToName(perm))
		}
	}
	return permissionNames
}

func PermissionToName(permission Permission) string {
	switch permission {
	case ViewDashboard:
		return "ViewDashboard"
	case ViewModels:
		return "ViewModels"
	case ViewUsers:
		return "ViewUsers"
	case ManageUsers:
		return "ManageUsers"
	case ManageModels:
		return "ManageModels"
	case Administrator:
		return "Administrator"
	default:
		return "Unknown"
	}
}

/*

for example:
	user.Permissions = permissions.BasicUser

	if permissions.HasPermission(user.Permissions, permissions.ViewDashboard) {
		// allow viewing dashboard
	}

	// multiple permissions
	if permissions.HasPermission(user.Permissions, permissions.ViewDashboard|permissions.ViewModels) {
		// allow if user has both ViewDashboard and ViewModels
	}
*/
