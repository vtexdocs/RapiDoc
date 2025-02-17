import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js'; // eslint-disable-line import/extensions
import { marked } from 'marked';
import processPathDescription from '../utils/magic-block-utils';
import { downloadResource, viewResource } from '../utils/common-utils';
import renderBlockquote from '../utils/renderBlockquote';
import postmanIcon from '../components/assets/postman-icon';
import openapiIcon from '../components/assets/openapi-icon';

/* eslint-disable indent */
function headingRenderer() {
  const renderer = new marked.Renderer();
  renderer.heading = ((text, level, raw, slugger) => `<h${level} class="observe-me" id="overview--${slugger.slug(raw)}">${text}</h${level}>`);
  return renderer;
}

export default function overviewTemplate() {
  this.resolvedSpec.info.description = processPathDescription(this.resolvedSpec.info.description);
  marked.Renderer.prototype.blockquote = renderBlockquote;

  return html`
    <section part="section-overview" class="observe-me ${this.renderStyle === 'view' ? 'section-gap' : 'section-gap--read-mode'}">
      <span part="anchor-endpoint" id="overview"></span>
      ${this.resolvedSpec?.info
        ? html`
          <div style="display: flex; flex-direction:column; row-gap: 20px; margin-bottom: 24px;">
            ${(this.specUrl && this.allowSpecFileDownload) ? html`<div><div style="display:flex; justify-content: flex-end; gap:8px; flex-wrap: wrap;">
                  <button class="m-btn m-btn-image m-btn-tertiary thin-border" style="padding-left: 0;" part="btn btn-outline" @click='${(e) => { downloadResource(this.specUrl, 'openapi-spec.json', e); }}'>
                    ${openapiIcon()}
                    Download OpenAPI spec
                  </button>
                    <button class="m-btn m-btn-image m-btn-secondary thin-border" part="btn btn-outline" @click='${(e) => { viewResource(this.specUrl, e); }}'>
                      ${openapiIcon()}
                      View OpenAPI spec
                    </button>
                </div></div>` : ''}
            ${this.postmanUrl ? html`<div><div style="display:flex; justify-content: flex-end; gap:8px; flex-wrap: wrap;">
                  <button class="m-btn m-btn-image m-btn-tertiary thin-border" style="padding-left: 0;" part="btn btn-outline" @click='${(e) => { downloadResource(this.postmanUrl, 'postman-collection.json', e); }}'>
                    ${postmanIcon()}
                    Download Postman collection
                  </button>
                    <button class="m-btn m-btn-image m-btn-secondary thin-border" part="btn btn-outline" @click='${(e) => { viewResource(this.postmanUrl, e); }}'>
                      ${postmanIcon()}
                      View Postman collection
                    </button>
                </div></div>` : ''}
          </div>
          <div id="api-title" part="section-overview-title" style="font-size:32px">
            ${this.resolvedSpec.info.title}
            ${!this.resolvedSpec.info.version ? '' : html`
              <code>
                ${this.resolvedSpec.info.version}
              </code>`
            }
          </div>
          <div id="api-info" style="font-size:calc(var(--font-size-regular) - 1px); margin-top:8px;">
            ${this.resolvedSpec.info.contact?.email
              ? html`<span>${this.resolvedSpec.info.contact.name || 'Email'}: 
                <a href="mailto:${this.resolvedSpec.info.contact.email}" part="anchor anchor-overview">${this.resolvedSpec.info.contact.email}</a>
              </span>`
              : ''
            }
            ${this.resolvedSpec.info.contact?.url
              ? html`<span>URL: <a href="${this.resolvedSpec.info.contact.url}" part="anchor anchor-overview">${this.resolvedSpec.info.contact.url}</a></span>`
              : ''
            }
            ${this.resolvedSpec.info.license
              ? html`<span>License: 
                ${this.resolvedSpec.info.license.url
                ? html`<a href="${this.resolvedSpec.info.license.url}" part="anchor anchor-overview">${this.resolvedSpec.info.license.name}</a>`
                : this.resolvedSpec.info.license.name
              } </span>`
              : ''
            }
            ${this.resolvedSpec.info.termsOfService
              ? html`<span><a href="${this.resolvedSpec.info.termsOfService}" part="anchor anchor-overview">Terms of Service</a></span>`
              : ''
            }
          </div>
          <slot name="overview"></slot>
          <div id="api-description">
          ${this.resolvedSpec.info.description
            ? html`${
              unsafeHTML(`
                <div class="m-markdown regular-font">
                ${marked(this.resolvedSpec.info.description, this.infoDescriptionHeadingsInNavBar === 'true' ? { renderer: headingRenderer() } : undefined)}
              </div>`)}`
            : ''
          }
          </div>
        `
        : ''
      }
    </section>
  `;
}
/* eslint-enable indent */
