
package com.pdstracker.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Integer logId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false, length = 150)
    private String action;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "activity_timestamp")
    private LocalDateTime activityTimestamp;

    public ActivityLog() {
    }

    @PrePersist
    public void setTimestamp() {
        if (activityTimestamp == null) {
            activityTimestamp = LocalDateTime.now();
        }
    }

    public Integer getLogId() {
        return logId;
    }

    public void setLogId(Integer logId) {
        this.logId = logId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getActivityTimestamp() {
        return activityTimestamp;
    }

    public void setActivityTimestamp(LocalDateTime activityTimestamp) {
        this.activityTimestamp = activityTimestamp;
    }
}
