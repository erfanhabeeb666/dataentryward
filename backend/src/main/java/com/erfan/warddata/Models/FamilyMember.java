package com.erfan.warddata.Models;

import com.erfan.warddata.Enums.Gender;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

@Entity
@Table(name = "family_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "household_id", nullable = false)
    private Long householdId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "date_of_birth")
    private Date dateOfBirth;

    @Column(name = "relationship_to_head")
    private String relationshipToHead;

    private String education;
    private String occupation;

    @Column(name = "monthly_income")
    private BigDecimal monthlyIncome;

    @Column(name = "aadhaar_number")
    private String aadhaarNumber;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "disability_flag")
    private Boolean disabilityFlag;

    @Column(name = "senior_citizen_flag")
    private Boolean seniorCitizenFlag;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;
}
