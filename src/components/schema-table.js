import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js'; // eslint-disable-line import/extensions
import { marked } from 'marked';
import FontStyles from '../styles/font-styles';
import SchemaStyles from '../styles/schema-styles';
import CustomStyles from '../styles/custom-styles';

export default class SchemaTable extends LitElement {
  static get properties() {
    return {
      schemaExpandLevel: { type: Number, attribute: 'schema-expand-level' },
      schemaDescriptionExpanded: { type: String, attribute: 'schema-description-expanded' },
      allowSchemaDescriptionExpandToggle: { type: String, attribute: 'allow-schema-description-expand-toggle' },
      schemaHideReadOnly: { type: String, attribute: 'schema-hide-read-only' },
      schemaHideWriteOnly: { type: String, attribute: 'schema-hide-write-only' },
      data: { type: Object },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.schemaExpandLevel || this.schemaExpandLevel < 1) { this.schemaExpandLevel = 99999; }
    if (!this.schemaDescriptionExpanded || !'true false'.includes(this.schemaDescriptionExpanded)) { this.schemaDescriptionExpanded = 'false'; }
    if (!this.schemaHideReadOnly || !'true false'.includes(this.schemaHideReadOnly)) { this.schemaHideReadOnly = 'true'; }
    if (!this.schemaHideWriteOnly || !'true false'.includes(this.schemaHideWriteOnly)) { this.schemaHideWriteOnly = 'true'; }
  }

  static get styles() {
    return [
      FontStyles,
      SchemaStyles,
      css`
      .table {
        font-size: var(--font-size-small);
        text-align: left;
        line-height: calc(var(--font-size-small) + 6px);
      }
      .param-table{
        border-radius: 4px;
        border:1px solid var(--light-border-color);
        border-bottom: none;
        margin-top: 10px;
        font-size: 14px;
      }
      .param-table .tr {
        border-bottom: 1px solid var(--light-border-color);
        display: grid;
        grid-template-columns: 3fr 2fr 4fr;
        overflow: hidden;
      }
      .param-table .td {
        padding: 4px 0;
      }
      .param-table .key {
        padding: 12px 10px 12px;
      }
      .table .key-descr {
        padding: 12px 10px 12px;
      }
      .table .key-descr p {
        margin: 0px;
        display: inline;
      }
      .key.deprecated .key-label {
        color: var(--red);
      }
      .deprecated-label{
        color: #ef6660;
        padding: 1px 5px;
        font-size: 12px;
        border: 1px solid #ef6660;
        border-radius: 4px;
      }
      .key-label {
        background-color: #f8f7fc;
        border-radius: 4px;
        padding: 0.2em 0.4em;
        font-family: var(--font-mono);
        font-size: 12px;
      }
      .param-table .key-type {
        border-left:1px solid var(--light-border-color);
        border-right:1px solid var(--light-border-color);
        padding: 12px 10px 12px;
      }
      .object-body .key-type {
        white-space: normal;
        color:#4A4A4A;
        font-family: var(--font-mono);
        font-size: 12px;
      }
      .collapsed-all-descr .tr:not(.expanded-descr) {
        max-height: calc(var(--font-size-regular) + var(--font-size-regular) + 10px);
      }
      .collapsed-all-descr .tr:not(.expanded-descr) .td p, .collapsed-all-descr .tr:not(.expanded-descr) .key, .collapsed-all-descr .tr:not(.expanded-descr) .key-type {
        text-overflow: ellipsis;
        display: inline;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
      }
      .obj-toggle {
        padding: 0 2px;
        border-radius:2px;
        border: 1px solid transparent;
        display: inline-block;
        margin-left: -16px;
        color:var(--primary-color);
        cursor:pointer;
        font-size: calc(var(--font-size-small) + 4px);
        font-family: var(--font-mono);
        background-clip: border-box;
      }
      .obj-toggle:hover {
        border-color: var(--primary-color);
      }
      .tr.expanded + .object-body {
        display:block;
      }
      .tr.collapsed + .object-body {
        display:none;
      }`,
      CustomStyles,
    ];
  }

  /* eslint-disable indent */
  render() {
    return html`
      <div class="table ${this.schemaDescriptionExpanded === 'true' ? 'expanded-all-descr' : 'collapsed-all-descr'}" @click="${(e) => this.handleAllEvents(e)}">
        <div class='toolbar'>
          <div class="toolbar-item schema-root-type ${this.data?.['::type'] || ''} "> ${this.data?.['::type'] || ''} </div>
          ${this.allowSchemaDescriptionExpandToggle === 'true'
            ? html`
              <div style="flex:1"></div>
              <div part="schema-multiline-toggle" class='toolbar-item schema-multiline-toggle' > 
                ${this.schemaDescriptionExpanded === 'true' ? 'Single line description' : 'Multiline description'}
              </div>
            `
            : ''
          }
        </div>
        ${this.data?.['::description']
          ? html`<span part="schema-description" class='m-markdown'> ${unsafeHTML(marked(this.data['::description'] || ''))}</span>`
          : ''
        }
        <div class="param-table">
          <div style='display:grid; grid-template-columns: 3fr 2fr 4fr; overflow: hidden; border-bottom:1px solid var(--light-border-color);'>
            <div class='key' style='font-family:var(--font-regular); font-weight:bold;'> Field </div>
            <div class='key-type' style='font-family:var(--font-regular); font-weight:bold;'> Type </div>
            <div class='key-descr' style='font-family:var(--font-regular); font-weight:bold;'> Description </div>
          </div>
          ${this.data
            ? html`
              ${this.generateTree(
                this.data['::type'] === 'array' ? this.data['::props'] : this.data,
                this.data['::type'],
                this.data['::array-type'],
              )}`
            : ''
          }  
        </div>
      </div>  
    `;
  }

  generateTree(data, dataType = 'object', arrayType = '', key = '', description = '', schemaLevel = 0, indentLevel = 0, readOrWrite = '') {
    if (this.schemaHideReadOnly === 'true') {
      if (dataType === 'array') {
        if (readOrWrite === 'readonly') {
          return;
        }
      }
      if (data && data['::readwrite'] === 'readonly') {
        return;
      }
    }
    if (this.schemaHideWriteOnly === 'true') {
      if (dataType === 'array') {
        if (readOrWrite === 'writeonly') {
          return;
        }
      }
      if (data && data['::readwrite'] === 'writeonly') {
        return;
      }
    }
    if (!data) {
      return html`<div class="tr">
        <div class="td key" style="padding-left:${(schemaLevel + 1) * 10}px">
        <span class="key-label xxx-of-key"> ${key.replace('::OPTION~', '')}</span>
        </div>
        <div class="td key-type">
        ${
          dataType === 'array'
            ? html`<span class='mono-font'> [ ] </span>`
            : dataType === 'object'
              ? html`<span class='mono-font'> { } </span>`
              : html`<span class='mono-font'> schema undefined </span>`
        }
        </div>
        <div class="td key-descr">${unsafeHTML(marked(description)) || ''}</div>
        </div>`;
    }

    const newSchemaLevel = data['::type']?.startsWith('xxx-of') ? schemaLevel : (schemaLevel + 1);
    const newIndentLevel = dataType === 'xxx-of-option' || data['::type'] === 'xxx-of-option' || key.startsWith('::OPTION') ? indentLevel : (indentLevel + 1);
    const leftPadding = 10 * newIndentLevel; // 2 space indentation at each level
    if (Object.keys(data).length === 0) {
      return html`<span class="td key object" style='padding-left:${leftPadding}px'>${key}</span>`;
    }
    let keyLabel = '';
    let keyDescr = '';
    let isOneOfLabel = false;
    if (key.startsWith('::ONE~OF') || key.startsWith('::ANY~OF')) {
      keyLabel = key.replace('::', '').replace('~', ' ');
      isOneOfLabel = true;
    } else if (key.startsWith('::OPTION')) {
      const parts = key.split('~');
      keyLabel = parts[1]; // eslint-disable-line prefer-destructuring
      keyDescr = parts[2]; // eslint-disable-line prefer-destructuring
    } else {
      keyLabel = key;
    }

    let detailObjType = '';
    if (data['::type'] === 'object') {
      if (dataType === 'array') {
        detailObjType = 'array of object'; // Array of Object
      } else {
        detailObjType = data['::dataTypeLabel'] || data['::type'];
      }
    } else if (data['::type'] === 'array') {
      if (dataType === 'array') {
        // detailObjType = 'array of array'; // Array of array
        detailObjType = `array of array ${arrayType !== 'object' ? `of ${arrayType}` : ''}`; // Array of array
      } else {
        detailObjType = data['::dataTypeLabel'] || data['::type'];
      }
    }

    if (typeof data === 'object') {
      return html`
        ${newSchemaLevel >= 0 && key
          ? html`
            <div class='tr ${newSchemaLevel <= this.schemaExpandLevel ? 'expanded' : 'collapsed'} ${data['::type']}' data-obj='${keyLabel}' title="${data['::deprecated'] ? 'Deprecated' : ''}">
              <div class="td key ${data['::deprecated'] ? 'deprecated' : ''}" style='padding-left:${leftPadding}px'>
                ${(keyLabel || keyDescr)
                  ? html`
                    <span class='obj-toggle ${newSchemaLevel < this.schemaExpandLevel ? 'expanded' : 'collapsed'}' data-obj='${keyLabel}'>
                      ${schemaLevel < this.schemaExpandLevel ? '-' : '+'}
                    </span>`
                  : ''
                }
                ${data['::type'] === 'xxx-of-option' || data['::type'] === 'xxx-of-array' || key.startsWith('::OPTION')
                  ? html`<span class="xxx-of-key" style="margin-left:-6px">${keyLabel}</span><span class="${isOneOfLabel ? 'xxx-of-key' : 'xxx-of-descr'}">${keyDescr}</span>`
                  : keyLabel.endsWith('*')
                    ? html`<span class="key-label" style="display:inline-block; margin-left:-6px;"><span>${data['::deprecated'] ? '❌' : ''} ${keyLabel.substring(0, keyLabel.length - 1)}</span><span style='color:var(--red);'>*</span></span>`
                    : html`<span class="key-label" style="display:inline-block; margin-left:-6px;"><span>${data['::deprecated'] ? '❌' : ''} ${keyLabel === '::props' ? '' : keyLabel}</span></span>`
                }
                ${data['::type'] === 'xxx-of' && dataType === 'array' ? html`<span style="color:var(--primary-color)">ARRAY</span>` : ''} 
              </div>
              <div class='td key-type' title="${data['::readwrite'] === 'readonly' ? 'Read-Only' : data['::readwrite'] === 'writeonly' ? 'Write-Only' : ''}"><span>
                ${(data['::type'] || '').includes('xxx-of') ? '' : detailObjType}
                ${data['::readwrite'] === 'readonly' ? ' 🆁' : data['::readwrite'] === 'writeonly' ? ' 🆆' : ''}
              </span></div>
              <div class='td key-descr' style='line-height:1.7'>${unsafeHTML(marked(description || ''))}</div>
            </div>`
          : html`
            ${data['::type'] === 'array' && dataType === 'array'
              ? html`
                <div class='tr'> 
                  <div class='td key'></div> 
                  <div class='td key-type'>
                    <span>${arrayType && arrayType !== 'object' ? `${dataType} of ${arrayType}` : dataType}</span>
                  </div> 
                  <div class='td key-descr'></div> 
                </div>`
              : ''
            }`
        }
        <div class='object-body'>
        ${Array.isArray(data) && data[0]
          ? html`${this.generateTree(data[0], 'xxx-of-option', '', '::ARRAY~OF', '', newSchemaLevel, newIndentLevel, '')}`
          : html`
            ${Object.keys(data).map((dataKey) => html`
              ${['::title', '::description', '::type', '::props', '::deprecated', '::array-type', '::readwrite', '::dataTypeLabel'].includes(dataKey)
                ? data[dataKey]['::type'] === 'array' || data[dataKey]['::type'] === 'object'
                  ? html`${this.generateTree(
                    data[dataKey]['::type'] === 'array' ? data[dataKey]['::props'] : data[dataKey],
                      data[dataKey]['::type'],
                      data[dataKey]['::array-type'] || '',
                      dataKey,
                      data[dataKey]['::description'],
                      newSchemaLevel,
                      newIndentLevel,
                      data[dataKey]['::readwrite'] ? data[dataKey]['::readwrite'] : '',
                    )}`
                  : ''
                : html`${this.generateTree(
                  data[dataKey]['::type'] === 'array' ? data[dataKey]['::props'] : data[dataKey],
                  data[dataKey]['::type'],
                  data[dataKey]['::array-type'] || '',
                  dataKey,
                  data[dataKey]?.['::description'] || '',
                  newSchemaLevel,
                  newIndentLevel,
                  data[dataKey]['::readwrite'] ? data[dataKey]['::readwrite'] : '',
                )}`
              }
            `)}
          `
        }
        <div>
      `;
    }

    // For Primitive Data types
    // eslint-disable-next-line no-unused-vars
    const [type, readOrWriteOnly, constraint, defaultValue, allowedValues, pattern, schemaDescription, schemaTitle, deprecated] = data.split('~|~');
    if (readOrWriteOnly === '🆁' && this.schemaHideReadOnly === 'true') {
      return;
    }
    if (readOrWriteOnly === '🆆' && this.schemaHideWriteOnly === 'true') {
      return;
    }
    const dataTypeCss = type.replace(/┃.*/g, '').replace(/[^a-zA-Z0-9+]/g, '').substring(0, 4).toLowerCase();
    const typeDivider = type.replaceAll('┃', ' | ');
    const descrExpander = `${schemaDescription.length >= 50 || constraint || defaultValue || allowedValues || pattern ? '<span class="descr-expand-toggle">➔</span>' : ''}`;
    let dataTypeHtml = '';
    if (dataType === 'array') {
      dataTypeHtml = html` 
        <div class='td key-type ${dataTypeCss}' title="${readOrWrite === 'readonly' ? 'Read-Only' : readOrWriteOnly === 'writeonly' ? 'Write-Only' : ''}"><span>
          [${typeDivider}] ${readOrWrite === 'readonly' ? '🆁' : readOrWrite === 'writeonly' ? '🆆' : ''}
        </span></div>`;
    } else {
      dataTypeHtml = html` 
        <div class='td key-type ${dataTypeCss}' title="${readOrWriteOnly === '🆁' ? 'Read-Only' : readOrWriteOnly === '🆆' ? 'Write-Only' : ''}"><span>
          ${typeDivider} ${readOrWriteOnly}
        </span></div>`;
    }
    return html`
      <div class = "tr primitive" title="${deprecated ? 'Deprecated' : ''}">
        <div class="td key ${deprecated}" style='padding-left:${leftPadding}px'>
          ${keyLabel?.endsWith('*')
            ? html`
              <span><span class="key-label">${keyLabel.substring(0, keyLabel.length - 1)}</span><span style='color:var(--red);'>*</span></span>`
            : key.startsWith('::OPTION')
              ? html`<span class='xxx-of-key'>${keyLabel}</span><span class="xxx-of-descr">${keyDescr}</span>`
              : html`${keyLabel ? html`<span class="key-label"> ${keyLabel}</span>` : html`<span class="xxx-of-descr">${schemaTitle}</span>`}`
          }
        </div>
        ${dataTypeHtml}
        <div class='td key-descr'>
          ${html`<span>
          ${deprecated ? html`<span class="deprecated-label">Deprecated</span>` : ''}
            ${unsafeHTML(marked(dataType === 'array'
              ? `${descrExpander} ${description}`
              : schemaTitle
                ? `${descrExpander} <b>${schemaTitle}:</b> ${schemaDescription}`
                : `${descrExpander} ${schemaDescription}`))}
          </span>`
          }
          ${constraint ? html`<div class='' style='display:inline-block; line-break:anywhere; margin-right:8px;'> <span class='bold-text'>Constraints: </span> ${constraint}</div>` : ''}
          ${defaultValue ? html`<div style='display:inline-block; line-break:anywhere; margin-right:8px; padding-top: 10px;'> <span class='bold-text'>Default: </span><span class="key-label">${defaultValue}</span></div>` : ''}
          ${allowedValues ? html`<div style='display:inline-block; line-break:anywhere; margin-right:8px;'> <span class='bold-text'>${type === 'const' ? 'Value' : 'Allowed'}: </span>${allowedValues}</div>` : ''}
          ${pattern ? html`<div style='display:inline-block; line-break:anywhere; margin-right:8px;'> <span class='bold-text'>Pattern: </span>${pattern}</div>` : ''}
        </div>
      </div>
    `;
  }
  /* eslint-enable indent */

  handleAllEvents(e) {
    if (e.target.classList.contains('obj-toggle')) {
      this.toggleObjectExpand(e);
    } else if (e.target.classList.contains('schema-multiline-toggle')) {
      this.schemaDescriptionExpanded = (this.schemaDescriptionExpanded === 'true' ? 'false' : 'true');
    } else if (e.target.classList.contains('descr-expand-toggle')) {
      const trEl = e.target.closest('.tr');
      if (trEl) {
        trEl.classList.toggle('expanded-descr');
        trEl.style.maxHeight = trEl.scrollHeight;
      }
    }
  }

  toggleObjectExpand(e) {
    const rowEl = e.target.closest('.tr');
    if (rowEl.classList.contains('expanded')) {
      rowEl.classList.add('collapsed');
      rowEl.classList.remove('expanded');
      e.target.innerText = '+';
    } else {
      rowEl.classList.remove('collapsed');
      rowEl.classList.add('expanded');
      e.target.innerText = '-';
    }
  }
}
if (!customElements.get('schema-table')) customElements.define('schema-table', SchemaTable);
