package com.erfan.warddata.Models;

import com.erfan.warddata.Enums.UserType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email; // Keeping email as username for JWT/Spring Security compatibility, can act as
                          // mobile if needed or separate

    @Column(name = "mobile_number")
    private String mobile;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", insertable = false, updatable = false)
    private UserType userType;

    private Boolean active = true;

    public User(Long id, String name, String email, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this instanceof SuperAdmin) {
            return List.of(new SimpleGrantedAuthority("SUPER_ADMIN"));
        } else if (this instanceof WardMember) {
            return List.of(new SimpleGrantedAuthority("WARD_MEMBER"));
        } else if (this instanceof FieldAgent) {
            return List.of(new SimpleGrantedAuthority("AGENT"));
        }

        if (userType != null) {
            return List.of(new SimpleGrantedAuthority(userType.name()));
        }

        return List.of();
    }

    public UserType getUserType() {
        if (userType != null)
            return userType;
        if (this instanceof SuperAdmin)
            return UserType.SUPER_ADMIN;
        if (this instanceof WardMember)
            return UserType.WARD_MEMBER;
        if (this instanceof FieldAgent)
            return UserType.AGENT;
        return null;
    }

    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_ward_mapping", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "ward_id"))
    private java.util.Set<Ward> assignedWards = new java.util.HashSet<>();
}
