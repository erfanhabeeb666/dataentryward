package com.erfan.warddata.Security;

import com.erfan.warddata.Enums.UserType;
import com.erfan.warddata.Models.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("wardSecurity")
public class WardAccessValidator {

    public boolean hasAccess(Long wardId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) {
            return false;
        }

        User user = (User) principal;

        if (user.getUserType() == UserType.SUPER_ADMIN) {
            return true;
        }

        // WARD_MEMBER and AGENT can only access assigned wards
        return user.getAssignedWards().stream()
                .anyMatch(ward -> ward.getId().equals(wardId));
    }

    public boolean canManageWard(Long wardId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) {
            return false;
        }

        User user = (User) principal;

        // ADMIN can manage everything
        if (user.getUserType() == UserType.SUPER_ADMIN)
            return true;

        // Ward Member can manage their assigned ward (e.g. create agents)
        return user.getUserType() == UserType.WARD_MEMBER && hasAccess(wardId);
    }
}
