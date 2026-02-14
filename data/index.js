/**
 * Central index for all fake integration data
 */
import SALESFORCE_DATA from "./salesforce";
import ZENDESK_DATA from "./zendesk";
import INTERCOM_DATA from "./intercom";
import SLACK_DATA from "./slack";
import GONG_DATA from "./gong";
import HUBSPOT_DATA from "./hubspot";

const INTEGRATION_DATA = {
  salesforce: SALESFORCE_DATA,
  zendesk: ZENDESK_DATA,
  intercom: INTERCOM_DATA,
  slack: SLACK_DATA,
  gong: GONG_DATA,
  hubspot: HUBSPOT_DATA,
};

/** Get all data for a specific integration */
export function getIntegrationData(integrationId) {
  return INTEGRATION_DATA[integrationId] || [];
}

/** Get all data across all integrations */
export function getAllIntegrationData() {
  return Object.values(INTEGRATION_DATA).flat();
}

/** Get data for multiple integrations */
export function getMultipleIntegrationData(integrationIds) {
  return integrationIds.flatMap((id) => INTEGRATION_DATA[id] || []);
}

export {
  SALESFORCE_DATA,
  ZENDESK_DATA,
  INTERCOM_DATA,
  SLACK_DATA,
  GONG_DATA,
  HUBSPOT_DATA,
};

export default INTEGRATION_DATA;
