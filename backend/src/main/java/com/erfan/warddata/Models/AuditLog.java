package com.erfan.warddata.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, VIEW

    @Column(nullable = false)
    private String entity; // HOUSEHOLD, FAMILY_MEMBER, USER

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "ward_id")
    private Long wardId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private Timestamp timestamp;
}
