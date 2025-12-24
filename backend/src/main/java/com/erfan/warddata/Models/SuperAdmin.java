package com.erfan.warddata.Models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("SUPER_ADMIN")
public class SuperAdmin extends User {
    public SuperAdmin(Long id, String name, String email, String password) {
        super(id, name, email, password);
    }

    public SuperAdmin() {
    }
}
