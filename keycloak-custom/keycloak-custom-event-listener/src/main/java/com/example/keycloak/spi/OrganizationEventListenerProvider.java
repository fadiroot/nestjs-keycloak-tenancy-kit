package com.example.keycloak.spi;

import java.net.HttpURLConnection;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.jboss.logging.Logger;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.util.Map;
import org.keycloak.events.admin.ResourceType;
import org.keycloak.events.admin.OperationType;
import java.util.HashMap;
import org.keycloak.organization.OrganizationProvider;
import org.keycloak.models.OrganizationModel;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class OrganizationEventListenerProvider implements EventListenerProvider {
    private static final Logger logger = Logger.getLogger(OrganizationEventListenerProvider.class);
    private final KeycloakSession session;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Environment variables without defaults
    private final String REALM;
    private final String KEYCLOAK_PORT;
    private final String API_URL;
    private final String APP_PORT;
    private final String KEYCLOAK_HOST;
    private final String ADMIN_USERNAME;
    private final String ADMIN_PASSWORD;
    private final String KEYCLOAK_CLIENT_ID;
    private final String KEYCLOAK_CLIENT_SECRET;
    private final String PROD_AUTH_URL;
    private final String PROD_API_URL;
    private final String API_VERSION;
    private final String GRANT_TYPE;
    private final String NODE_ENV;

    public OrganizationEventListenerProvider(KeycloakSession session) {
        this.session = session;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();

        // Initialize and validate environment variables
        Map<String, String> env = System.getenv();

        // Initialize all environment variables and log if missing
        this.REALM = getEnvOrLogMissing(env, "KEYCLOAK_REALM");
        this.KEYCLOAK_PORT = getEnvOrLogMissing(env, "KEYCLOAK_PORT");
        this.API_URL = getEnvOrLogMissing(env, "API_URL_SPI");
        this.APP_PORT = getEnvOrLogMissing(env, "APP_PORT");
        this.KEYCLOAK_HOST = getEnvOrLogMissing(env, "KEYCLOAK_HOST");
        this.ADMIN_USERNAME = getEnvOrLogMissing(env, "KEYCLOAK_ADMIN");
        this.ADMIN_PASSWORD = getEnvOrLogMissing(env, "KEYCLOAK_ADMIN_PASSWORD");
        this.KEYCLOAK_CLIENT_ID = getEnvOrLogMissing(env, "KEYCLOAK_CLIENT_ID");
        this.KEYCLOAK_CLIENT_SECRET = getEnvOrLogMissing(env, "KEYCLOAK_CLIENT_SECRET");
        this.PROD_AUTH_URL = getEnvOrLogMissing(env, "PROD_AUTH_URL");
        this.PROD_API_URL = getEnvOrLogMissing(env, "PROD_API_URL");
        this.API_VERSION = getEnvOrLogMissing(env, "API_VERSION");
        this.GRANT_TYPE = getEnvOrLogMissing(env, "GRANT_TYPE");
        this.NODE_ENV = getEnvOrLogMissing(env, "NODE_ENV");

        // Log all environment variables
        logEnvironmentVariables();
    }

    private String getEnvOrLogMissing(Map<String, String> env, String key) {
        String value = env.get(key);
        if (value == null || value.trim().isEmpty()) {
            logger.error("Missing required environment variable: " + key);
            throw new RuntimeException("Missing required environment variable: " + key);
        }
        return value;
    }

    private void logEnvironmentVariables() {
        logger.info("=== Environment Variables ===");
        logger.info("REALM: " + REALM);
        logger.info("KEYCLOAK_PORT: " + KEYCLOAK_PORT);
        logger.info("API_URL: " + API_URL);
        logger.info("APP_PORT: " + APP_PORT);
        logger.info("KEYCLOAK_HOST: " + KEYCLOAK_HOST);
        logger.info("ADMIN_USERNAME: " + ADMIN_USERNAME);
        logger.info("KEYCLOAK_CLIENT_ID: " + KEYCLOAK_CLIENT_ID);
        logger.info("PROD_AUTH_URL: " + PROD_AUTH_URL);
        logger.info("PROD_API_URL: " + PROD_API_URL);
        logger.info("API_VERSION: " + API_VERSION);
        logger.info("NODE_ENV: " + NODE_ENV);
        

        // Don't log sensitive information like ADMIN_PASSWORD and
        // KEYCLOAK_CLIENT_SECRET
    }

    @Override
    public void onEvent(AdminEvent adminEvent, boolean includeRepresentation) {
        logger.info("=== Admin Event Details ===");
        logger.info("Operation Type: " + adminEvent.getOperationType());
        logger.info("Resource Type: " + adminEvent.getResourceType());
        logger.info("Resource Path: " + adminEvent.getResourcePath());

        // Check for organization member addition by path pattern
        if (adminEvent.getOperationType() == OperationType.CREATE
                && adminEvent.getResourcePath().matches(".*/organizations/.*/members/.*")) {

            logger.info("=== Member Added to Organization ===");
            handleMemberAddition(adminEvent);
        }
    }

    private void handleMemberAddition(AdminEvent adminEvent) {
        try {
            String[] pathParts = adminEvent.getResourcePath().split("/");
            String orgId = null;
            String userId = null;

            // Extract orgId and userId from path
            for (int i = 0; i < pathParts.length - 1; i++) {
                if ("organizations".equals(pathParts[i])) {
                    orgId = pathParts[i + 1];
                } else if ("members".equals(pathParts[i])) {
                    userId = pathParts[i + 1];
                }
            }

            logger.info("Organization ID: " + orgId);
            logger.info("User ID: " + userId);

            if (orgId != null && userId != null) {
                // Create data map for the API call
                Map<String, String> data = new HashMap<>();
                data.put("organizationId", orgId);
                data.put("userId", userId);
                data.put("action", "MEMBER_ADDED");
                data.put("eventTime", String.valueOf(System.currentTimeMillis()));

                // Add user details if available
                Map<String, String> userData = getBasicUserData(userId);
                if (userData != null) {
                    data.putAll(userData);
                }
                ;

                logger.info("Successfully processed member addition");
            }

        } catch (Exception e) {
            logger.error("Failed to process member addition", e);
            logger.error("Stack trace:", e);
        }
    }

    @Override
    public void onEvent(Event event) {
        if (event == null)
            return;

        logger.info("=== Event Details ===");
        logger.info("Event Type: " + event.getType());
        logger.info("User ID: " + event.getUserId());
        logger.info("Details: " + event.getDetails());

        switch (event.getType().toString()) {
            case "INVITE_ORG":
                handleUserEvent(event, "MEMBER_INVITED");
                break;
            case "REGISTER":
                handleUserEvent(event, "USER_REGISTERED");
                break;
        }
    }

    private void handleUserEvent(Event event, String action) {
        try {
            logger.info("=== " + action + " Event ===");
            Map<String, String> userData = getUserData(event);
            if (userData != null) {

                if (action.equals("MEMBER_INVITED") || action.equals("USER_REGISTERED")) {
                    // Get all organizations for this user
                    UserModel user = session.users().getUserById(session.getContext().getRealm(), event.getUserId());
                    if (user != null) {
                        OrganizationProvider organizationProvider = session.getProvider(OrganizationProvider.class);
                        Stream<OrganizationModel> userOrgs = organizationProvider.getByMember(user);
                        // Convert to list and log
                        List<String> orgIds = new ArrayList<>();
                        List<String> orgNames = new ArrayList<>();
                        userOrgs.forEach(org -> {
                            orgIds.add(org.getId());
                            orgNames.add(org.getName());
                            logger.info("User organization found: " + org.getName() + " (ID: " + org.getId() + ")");
                        });
                        // Get the last organization
                        if (!orgIds.isEmpty()) {
                            logger.info("Added organizations to user data: " + orgIds);
                        }
                        String orgId = orgIds.get(orgIds.size() - 1);
                        sendToTenantApi(userData, orgId);
                    }
                }
                logger.info("Final user data to be sent: " + userData);
            }
        } catch (Exception e) {
            logger.error("Error processing " + action + " event", e);
            logger.error("Stack trace:", e);
        }
    }

    private Map<String, String> getUserData(Event event) {
        RealmModel realm = session.getContext().getRealm();
        UserModel user = session.users().getUserById(realm, event.getUserId());

        if (user != null) {
            Map<String, String> userData = new HashMap<>();

            // Basic user information
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("firstName", user.getFirstName());
            userData.put("lastName", user.getLastName());
            return userData;
        } else {
            logger.error("User not found with ID: " + event.getUserId());
            return null;
        }
    }

    private Map<String, String> getBasicUserData(String userId) {
        RealmModel realm = session.getContext().getRealm();
        UserModel user = session.users().getUserById(realm, userId);

        if (user != null) {
            Map<String, String> userData = new HashMap<>();
            userData.put("userId", user.getId());
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("firstName", user.getFirstName());
            userData.put("lastName", user.getLastName());
            return userData;
        }
        return null;
    }

    private String getAdminAccessToken() {
        try {
            URI uri;
            switch (NODE_ENV) {
                case "production":
                    uri = URI.create(PROD_AUTH_URL + "/realms/" + REALM + "/protocol/openid-connect/token");
                    break;
                case "development":
                    uri = URI.create(String.format("http://%s:%s/realms/%s/protocol/openid-connect/token",
                            KEYCLOAK_HOST,
                            KEYCLOAK_PORT,
                            REALM));
                    break;
                default:
                    throw new RuntimeException("Unknown NODE_ENV value");
            }
            
            logger.info("=== Token Request Details ===");
            logger.info("Token URL: " + uri.toString());
            logger.info("Method: POST");

            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            conn.setDoOutput(true);

            // Use environment variables for admin credentials
            String urlParameters = String.format("client_id=%s&client_secret=%s&grant_type=password&username=%s&password=%s",
                KEYCLOAK_CLIENT_ID,
                KEYCLOAK_CLIENT_SECRET,
                "admin",
                "admin"
            );

            logger.info("Request Headers:");
            logger.info("Content-Type: application/x-www-form-urlencoded");
            logger.info("Request Parameters:");
            logger.info("client_id: " + KEYCLOAK_CLIENT_ID);
            logger.info("grant_type: password");
            logger.info("username: " + ADMIN_USERNAME);
            // Don't log sensitive data like client_secret and password

            try (DataOutputStream wr = new DataOutputStream(conn.getOutputStream())) {
                wr.write(urlParameters.getBytes(StandardCharsets.UTF_8));
            }

            int responseCode = conn.getResponseCode();
            StringBuilder content = new StringBuilder();

            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(
                            responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream()))) {
                String line;
                while ((line = in.readLine()) != null) {
                    content.append(line);
                }
            }

            logger.info("Response Code: " + responseCode);
            logger.info("Response Content: " + content.toString());

            if (responseCode >= 400) {
                throw new IOException(
                        "Failed to get token. Response code: " + responseCode + ", Response: " + content.toString());
            }

            conn.disconnect();
            JsonNode jsonResponse = objectMapper.readTree(content.toString());
            String accessToken = jsonResponse.get("access_token").asText();
            logger.info("Access token successfully retrieved");

            return accessToken;
        } catch (Exception e) {
            logger.error("Failed to get admin access token", e);
            throw new RuntimeException("Failed to get admin access token", e);
        }
    }

    private void sendToTenantApi(Map<String, String> data, String orgId) {
        try {
            String adminToken = getAdminAccessToken();
            logger.info(PROD_API_URL + API_VERSION + "/users");

            String BACKEND_URL;
            switch (NODE_ENV) {
                case "production":
                    BACKEND_URL = PROD_API_URL + API_VERSION + "/users";
                    break;
                case "development":
                    BACKEND_URL = String.format("http://%s:%s/api/%s/users", 
                        API_URL,        // host.docker.internal
                        APP_PORT,       // 3000
                        API_VERSION     // v1
                    );
                    break;
                default:
                    throw new RuntimeException("Unknown NODE_ENV value");
            }
            logger.info("BACKEND_URL: " + BACKEND_URL);

            URI uri = URI.create(BACKEND_URL);
            logger.info("Making request to: " + uri.toString());

            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");

            // Add bearer token authorization header with "Bearer " prefix
            conn.setRequestProperty("Authorization", "Bearer " + adminToken);
            conn.setRequestProperty("organization-kc-id", orgId);

            // Log headers for debugging
            logger.info("Request Headers:");
            conn.getRequestProperties().forEach((key, value) -> logger.info(key + ": " + value));

            // Use Jackson ObjectMapper to serialize data
            String jsonString = objectMapper.writeValueAsString(data);
            logger.info("Request Body: " + jsonString);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonString.getBytes(StandardCharsets.UTF_8));
                os.flush();
            }

            int responseCode = conn.getResponseCode();
            logger.info("Response Code: " + responseCode);

            // Handle response
            if (responseCode >= 200 && responseCode < 300) {
                try (BufferedReader br = new BufferedReader(
                        new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        response.append(line);
                    }
                    logger.info("Response Body: " + response.toString());
                }
            } else {
                try (BufferedReader br = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    StringBuilder error = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        error.append(line);
                    }
                    logger.error("Error Response: " + error.toString());
                    throw new IOException("Server returned HTTP response code: " + responseCode
                            + " with message: " + error.toString());
                }
            }

            conn.disconnect();

        } catch (Exception e) {
            logger.error("Failed to send data to tenant API", e);
            throw new RuntimeException("Failed to send data to tenant API", e);
        }
    }

    @Override
    public void close() {
        // No resources to clean up
    }

    // Add these new helper methods

}