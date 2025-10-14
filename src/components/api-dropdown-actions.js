import { LitElement, css, html } from 'lit'
import postmanIcon from './assets/postman-icon'
import openapiIcon from './assets/openapi-icon'
import iconCaret from './assets/icon-caret'
import { downloadResource, viewResource } from '../utils/common-utils';

class ApiActionsMenu extends LitElement {
  static properties = {
    specUrl: { type: String },
    postmanUrl: { type: String },
    open: { type: Boolean, reflect: true },
  }

  constructor() {
    super()
    this.specUrl = ''
    this.postmanUrl = ''
    this.open = false

    // fechar ao clicar fora / ESC (opcional mas útil)
    this._onDocClick = (e) => {
      if (!this.open) return
      const path = e.composedPath()
      if (!path.includes(this)) this.open = false
    }
    this._onKeyDown = (e) => {
      if (e.key === 'Escape') this.open = false
    }
  }

  connectedCallback() {
    super.connectedCallback()
    document.addEventListener('click', this._onDocClick)
    document.addEventListener('keydown', this._onKeyDown, true)
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick)
    document.removeEventListener('keydown', this._onKeyDown, true)
    super.disconnectedCallback()
  }

  static styles = css`
    :host {
      display: inline-flex;
      position: relative;
    }

    .main-btn {
      font-family: var(--font-regular);
      color: #4a596b;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0px 8px;
      height: 36px;
      background: #fff;
      border: 1px solid #e7e9ee;
      border-radius: 4px 0 0 4px;
      cursor: pointer;
      border-right: none;
      font-size: 12px;
    }

    .main-btn:hover {
      background: #f8fafc;
    }

    .toggle-btn {
      padding: 0px 4px;
      background: #fff;
      border: 1px solid #e7e9ee;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      width: 28px;
      font-size: 12px;
    }

    .toggle-btn:hover {
      background: #f8fafc;
    }

    .menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      min-width: 240px;
      z-index: 100;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      background: none;
      border: 0;
      text-align: left;
      padding: 8px;
      cursor: pointer;
      font-size: 12px;
      color: #4a596b;
      font-family: var(--font-regular);
      height: 40px;
    }

    .item:hover {
      background: #f3f4f6;
    }

    .divider {
      height: 1px;
      background: #e5e7eb;
    }

    .caret {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: none;
    }

    :host([open]) .caret {
      transform: rotate(180deg);
    }
  `

  _toggleMenu() {
    this.open = !this.open
  }

  render() {
    return html`
      <button
        class="main-btn"
        @click=${() =>
          downloadResource(this.postmanUrl, 'postman-collection.json')}
        ?disabled=${!this.postmanUrl}
      >
        ${postmanIcon()} Download Postman collection
      </button>

      <button class="toggle-btn" @click=${this._toggleMenu}>
        <span class="caret">${iconCaret()}</span>
      </button>

      ${this.open
        ? html`
            <div class="menu">
              ${this.postmanUrl
                ? html`
                    <button
                      class="item"
                      @click=${() => viewResource(this.postmanUrl)}
                    >
                      ${postmanIcon()} View Postman collection
                    </button>
                    <div class="divider"></div>
                  `
                : null}
              ${this.specUrl
                ? html`
                    <button
                      class="item"
                      @click=${() =>
                        downloadResource(this.specUrl, 'openapi-spec.json')}
                    >
                      <span class="icon">${openapiIcon()}</span>
                      Download OpenAPI spec
                    </button>
                    <button
                      class="item"
                      @click=${() => viewResource(this.specUrl)}
                    >
                      <span class="icon">${openapiIcon()}</span>
                      View OpenAPI spec
                    </button>
                  `
                : null}
            </div>
          `
        : null}
    `
  }
}

customElements.define('api-dropdown-actions', ApiActionsMenu)
