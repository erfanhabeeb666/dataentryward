package com.erfan.warddata;

import com.erfan.warddata.Enums.*;
import com.erfan.warddata.Models.*;
import com.erfan.warddata.Repos.*;
import com.erfan.warddata.Services.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WardRepository wardRepository;
    private final HouseholdRepository householdRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, WardRepository wardRepository,
            HouseholdRepository householdRepository, FamilyMemberRepository familyMemberRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.wardRepository = wardRepository;
        this.householdRepository = householdRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0)
            return; // Prevent re-seeding

        System.out.println("Seeding Data...");

        // 2. Create Users
        // SUPER_ADMIN
        SuperAdmin admin = new SuperAdmin();
        admin.setName("Super Admin");
        admin.setEmail("super@admin.com"); // Login ID
        admin.setMobile("9999999999");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setUserType(UserType.SUPER_ADMIN);
        admin.setActive(true);
        userRepository.save(admin);

        System.out.println("Seeding Completed.");
    }
}
