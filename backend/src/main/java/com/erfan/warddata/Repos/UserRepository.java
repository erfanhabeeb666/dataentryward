package com.erfan.warddata.Repos;

import com.erfan.warddata.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

@org.springframework.stereotype.Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String normalizedEmail);

    java.util.List<User> findByUserType(com.erfan.warddata.Enums.UserType userType);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u JOIN u.assignedWards w WHERE w.id = :wardId AND u.userType = :userType")
    java.util.List<User> findByAssignedWards_IdAndUserType(
            @org.springframework.data.repository.query.Param("wardId") Long wardId,
            @org.springframework.data.repository.query.Param("userType") com.erfan.warddata.Enums.UserType userType);
}
