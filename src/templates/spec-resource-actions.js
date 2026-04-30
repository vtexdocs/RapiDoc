import { html } from 'lit';
import {
  downloadResource,
  downloadTextAsFile,
  viewResource,
  viewTextInNewTab,
} from '../utils/common-utils';
import openapiIcon from '../components/assets/openapi-icon';
import postmanIcon from '../components/assets/postman-icon';

const ICON = { width: 18, height: 18 };

/**
 * Devportal-style OpenAPI / Postman actions: ghost Download + filled View per row.
 * Inline `spec` (no `spec-url`) is supported for admin / embedded JSON.
 */
export default function specResourceActionsTemplate() {
  const specStr = typeof this.spec === 'string' ? this.spec.trim() : '';
  const allowOpenapi = this.allowSpecFileDownload !== 'false';
  const showOpenapi = allowOpenapi && (Boolean(this.specUrl) || Boolean(specStr));
  const showPostman = Boolean(this.postmanUrl);
  if (!showOpenapi && !showPostman) {
    return html``;
  }
  return html`
    <div
      class="spec-resource-actions-wrap"
      part="section-spec-resources"
    >
      ${showOpenapi
        ? html`
            <div class="spec-resource-actions__row">
              <button
                type="button"
                class="spec-resource-actions__download"
                part="btn-download-openapi"
                aria-label="Download OpenAPI specification"
                @click="${() => {
                  if (this.specUrl) {
                    downloadResource(this.specUrl, 'openapi-spec.json');
                  } else if (specStr) {
                    downloadTextAsFile(specStr, 'openapi-spec.json');
                  }
                }}"
              >
                ${openapiIcon(ICON)}
                <span class="spec-resource-actions__label">Download</span>
              </button>
              <button
                type="button"
                class="spec-resource-actions__view"
                part="btn-view-openapi"
                aria-label="View OpenAPI specification"
                @click="${() => {
                  if (this.specUrl) {
                    viewResource(this.specUrl);
                  } else if (specStr) {
                    viewTextInNewTab(specStr);
                  }
                }}"
              >
                ${openapiIcon(ICON)}
                <span class="spec-resource-actions__label">View</span>
              </button>
            </div>
          `
        : ''}
      ${showPostman
        ? html`
            <div class="spec-resource-actions__row">
              <button
                type="button"
                class="spec-resource-actions__download"
                part="btn-download-postman"
                aria-label="Download Postman collection"
                @click="${(e) =>
                  downloadResource(this.postmanUrl, 'postman-collection.json', e)}"
              >
                ${postmanIcon(ICON)}
                <span class="spec-resource-actions__label">Download</span>
              </button>
              <button
                type="button"
                class="spec-resource-actions__view"
                part="btn-view-postman"
                aria-label="View Postman collection"
                @click="${(e) => viewResource(this.postmanUrl, e)}"
              >
                ${postmanIcon(ICON)}
                <span class="spec-resource-actions__label">View</span>
              </button>
            </div>
          `
        : ''}
    </div>
  `;
}
