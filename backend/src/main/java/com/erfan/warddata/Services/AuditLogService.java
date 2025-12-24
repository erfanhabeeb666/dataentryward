package com.erfan.warddata.Services;

import com.erfan.warddata.Models.AuditLog;
import com.erfan.warddata.Repos.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(Long userId, String action, String entity, Long entityId, Long wardId, String details) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setWardId(wardId);
        log.setDetails(details);
        log.setTimestamp(Timestamp.from(Instant.now()));
        auditLogRepository.save(log);
    }
}
