package com.example.keycloak.spi;

import org.keycloak.Config;
import org.keycloak.events.EventListenerProviderFactory;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;

public class OrganizationEventListenerFactory implements EventListenerProviderFactory {
    private Config.Scope config;
    private String tenantApiUrl;

    @Override
    public EventListenerProvider create(KeycloakSession session) {
        return new OrganizationEventListenerProvider(session);
    }

    @Override
    public void init(Config.Scope config) {
        this.config = config;
        this.tenantApiUrl = config.get("tenant.api.url", "http://localhost:3000/api/v1/tenants");
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
        // Not needed for this implementation
    }

    @Override
    public void close() {
        // Cleanup if needed
    }

    @Override
    public String getId() {
        return "organization-event-listener";
    }
}