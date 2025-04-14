package com.example.keycloak.spi;

import org.keycloak.provider.Provider;

public interface OrganizationEventProvider extends Provider {
    void onOrganizationMembershipChange(String organizationId, String userId, String eventType);
    void onInvitationAccepted(String organizationId, String invitationId, String userId);
    void onJoinRequestApproved(String organizationId, String requestId, String userId);
}