import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js'; // eslint-disable-line import/extensions
import { guard } from 'lit/directives/guard.js'; // eslint-disable-line import/extensions
import { marked } from 'marked';
import formatXml from 'xml-but-prettier';
import Prism from 'prismjs';
import TableStyles from '../styles/table-styles';
import FlexStyles from '../styles/flex-styles';
import InputStyles from '../styles/input-styles';
import FontStyles from '../styles/font-styles';
import BorderStyles from '../styles/border-styles';
import TabStyles from '../styles/tab-styles';
import PrismStyles from '../styles/prism-styles';
import PrismLanguagesStyles from '../styles/prism-languages-styles';
import CustomStyles from '../styles/custom-styles';
import { copyToClipboard, downloadResource, viewResource } from '../utils/common-utils';
import { schemaInObjectNotation,
  getTypeInfo,
  generateExample,
  normalizeExamples,
  getSchemaFromParam,
  nestExampleIfPresent,
  anyExampleWithSummaryOrDescription } from '../utils/schema-utils';
import './json-tree';
import './schema-tree';
import './tag-input';
import './breadcrumbs';

import serverTemplate from '../templates/server-template';
import securitySchemeTemplate from '../templates/security-scheme-template';
import languagePickerTemplate from '../templates/language-picker-template';
import updateCodeExample from '../utils/update-code-example';
import copySymbol from './assets/copy-symbol';

export default class ApiRequest extends LitElement {
  constructor() {
    super();
    this.resolvedSpec = {};
    this.responseMessage = '';
    this.resultLoad = false;
    this.responseStatus = 'success';
    this.responseHeaders = '';
    this.responseText = '';
    this.responseUrl = '';
    this.codeExample = '';
    this.activeResponseTab = 'response'; // allowed values: response, headers, curl
    this.selectedRequestBodyType = '';
    this.selectedRequestBodyExample = '';
    this.selectedAuthScheme = 0;
    this.activeParameterSchemaTabs = {};
    this.showCurlBeforeTry = true;
    this.selectedLanguage = 'shell';
  }

  static get properties() {
    return {
      schemaShortSummary: { type: String, attribute: 'schema-short-summary' },
      serverUrl: { type: String, attribute: 'server-url' },
      resolvedSpec: { type: Object },
      selectedServer: { type: Object },
      servers: { type: Array },
      method: { type: String },
      path: { type: String },
      security: { type: Array },
      parameters: { type: Array },
      request_body: { type: Object },
      api_keys: { type: Array },
      parser: { type: Object },
      accept: { type: String },
      callback: { type: String },
      webhook: { type: String },
      responseMessage: { type: String, attribute: false },
      responseText: { type: String, attribute: false },
      responseHeaders: { type: String, attribute: false },
      responseStatus: { type: String, attribute: false },
      responseUrl: { type: String, attribute: false },
      codeExample: { type: String, attribute: false },
      fillRequestFieldsWithExample: { type: String, attribute: 'fill-request-fields-with-example' },
      allowTry: { type: String, attribute: 'allow-try' },
      showCurlBeforeTry: { type: String, attribute: 'show-curl-before-try' },
      renderStyle: { type: String, attribute: 'render-style' },
      schemaStyle: { type: String, attribute: 'schema-style' },
      activeSchemaTab: { type: String, attribute: 'active-schema-tab' },
      activeParameterSchemaTabs: {
        type: Object,
        converter: {
          fromAttribute: (attr) => JSON.parse(attr),
          toAttribute: (prop) => JSON.stringify(prop),
        },
        attribute: 'active-parameter-schema-tabs',
      },
      schemaExpandLevel: { type: Number, attribute: 'schema-expand-level' },
      schemaDescriptionExpanded: { type: String, attribute: 'schema-description-expanded' },
      allowSchemaDescriptionExpandToggle: { type: String, attribute: 'allow-schema-description-expand-toggle' },
      schemaHideReadOnly: { type: String, attribute: 'schema-hide-read-only' },
      schemaHideWriteOnly: { type: String, attribute: 'schema-hide-write-only' },
      fetchCredentials: { type: String, attribute: 'fetch-credentials' },

      // properties for internal tracking
      activeResponseTab: { type: String }, // internal tracking of response-tab not exposed as a attribute
      selectedRequestBodyType: { type: String, attribute: 'selected-request-body-type' }, // internal tracking of selected request-body type
      selectedRequestBodyExample: { type: String, attribute: 'selected-request-body-example' }, // internal tracking of selected request-body example

      selectedAuthScheme: { type: Number },
      selectedLanguage: { type: String },

      // open-api file download
      specUrl: { type: String, attribute: 'spec-url' },
      allowSpecFileDownload: { type: String, attribute: 'allow-spec-file-download' },
    };
  }

  static get styles() {
    return [
      TableStyles,
      InputStyles,
      FontStyles,
      FlexStyles,
      BorderStyles,
      TabStyles,
      PrismStyles,
      PrismLanguagesStyles,
      css`
        *, *:before, *:after { box-sizing: border-box; }
        :where(button, input[type="checkbox"], [tabindex="0"]):focus-visible { box-shadow: var(--focus-shadow); }
        :where(input[type="text"], input[type="password"], select, textarea):focus-visible { border-color: var(--primary-color); }
        tag-input:focus-within { outline: 1px solid;}
        .read-mode {
          border-top: 1px solid #E7E9EE;
          margin-top: 24px;
        }

        .param-name {
          font-size: 14px;
          font-weight: normal;
          line-height: 20px;
          color: #545454; 
          margin-block: 24px 4px;
          font-family: var(--font-regular);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .param-name.deprecated { 
          color: #DC5A41;
        }
        .param-type{
          line-height: 16px;
          color: #4A4A4A; 
          font-family: var(--font-mono);
          font-size: var(--font-size-mono);
        }

        .param-type > span {
          margin-left: 8px;
        }

        .param-constraint{
          min-width:100px;
        }
        .param-constraint:empty{
          display:none;
        }

        .param-description {
          font-size: 13px;
          line-height: 18px;
          color: #4A4A4A;
        }

        .top-gap{margin-top:24px;}

        .textarea {
          min-height:220px; 
          padding:5px;
          resize:vertical;
          direction: ltr;
        }
        .example:first-child {
          margin-top: -9px;
        }

        .response-message{
          font-weight:bold;
          text-overflow: ellipsis;
        }
        .response-message.error {
          color:var(--red);
        }
        .response-message.success {
          color:var(--blue);
        }

        .file-input-container {
          align-items:flex-end;
        }
        .file-input-container .input-set:first-child .file-input-remove-btn{
          visibility:hidden;
        }

        .file-input-remove-btn{
          font-size:16px;
          color:var(--red);
          outline: none;
          border: none;
          background:none;
          cursor:pointer;
        }

        .v-tab-btn {
          font-size: var(--smal-font-size);
          height:24px; 
          border:none; 
          background:none; 
          opacity: 0.3;
          cursor: pointer;
          padding: 4px 8px;
        }
        .v-tab-btn.active {
          font-weight: bold;
          background: var(--bg);
          opacity: 1;
        }

        @media only screen and (min-width: 768px) {
          .textarea {
            padding:8px;
          }
        }

        @media only screen and (max-width: 470px) {
          .hide-in-small-screen {
            display:none;
          }
        }
      `,
      CustomStyles,
    ];
  }

  render() {
    return html`
    <div class="row-api regular-font request-panel ${'read focused'.includes(this.renderStyle) || this.callback === 'true' ? 'read-mode' : 'view-mode'}">
      <div class="row-api-left">
        ${guard([this.method, this.path, this.allowTry, this.parameters, this.activeParameterSchemaTabs], () => this.inputParametersTemplate('path'))}
        ${guard([this.method, this.path, this.allowTry, this.parameters, this.activeParameterSchemaTabs], () => this.inputParametersTemplate('query'))}
        ${this.requestBodyTemplate()}
        ${guard([this.method, this.path, this.allowTry, this.parameters, this.activeParameterSchemaTabs], () => this.inputParametersTemplate('header'))}
        ${guard([this.method, this.path, this.allowTry, this.parameters, this.activeParameterSchemaTabs], () => this.inputParametersTemplate('cookie'))}
        ${this.allowTry === 'false' ? '' : html`${this.apiCallTemplate()}`}
      </div>
      <div class="row-api-right">
        ${languagePickerTemplate.call(this)}
        ${securitySchemeTemplate.call(this)}
        ${serverTemplate.call(this)}
        ${this.apiResponseTabTemplate()}
      </div>  
    </div>
    `;
  }

  async updated() {
    if (this.showCurlBeforeTry === 'true') {
      updateCodeExample.call(this, this.shadowRoot);
    }

    // In focused mode after rendering the request component, update the text-areas(which contains examples) using
    // the original values from hidden textareas
    // This is done coz, user may update the dom by editing the textarea's and once the DOM is updated externally change detection wont happen, therefore update the values manually

    // if (this.renderStyle === 'focused') {
    //   if (changedProperties.size === 1 && changedProperties.has('activeSchemaTab')) {
    //     // dont update example as only tabs is switched
    //   } else {
    //     this.requestUpdate();
    //   }
    // }

    if (this.webhook === 'true') {
      this.allowTry = 'false';
    }
  }

  async saveExampleState() {
    if (this.renderStyle === 'focused') {
      const reqBodyTextAreaEls = [...this.shadowRoot.querySelectorAll('textarea.request-body-param-user-input')];
      reqBodyTextAreaEls.forEach((el) => {
        el.dataset.user_example = el.value;
      });
      const exampleTextAreaEls = [...this.shadowRoot.querySelectorAll('textarea[data-ptype="form-data"]')];
      exampleTextAreaEls.forEach((el) => {
        el.dataset.user_example = el.value;
      });
      this.requestUpdate();
    }
  }

  async updateExamplesFromDataAttr() {
    // In focused mode after rendering the request component, update the text-areas(which contains examples) using
    // the original values from hidden textareas
    // This is done coz, user may update the dom by editing the textarea's and once the DOM is updated externally change detection wont happen, therefore update the values manually
    if (this.renderStyle === 'focused') {
      const reqBodyTextAreaEls = [...this.shadowRoot.querySelectorAll('textarea.request-body-param-user-input')];
      reqBodyTextAreaEls.forEach((el) => {
        el.value = el.dataset.user_example || el.dataset.example;
      });
      const exampleTextAreaEls = [...this.shadowRoot.querySelectorAll('textarea[data-ptype="form-data"]')];
      exampleTextAreaEls.forEach((el) => {
        el.value = el.dataset.user_example || el.dataset.example;
      });
      this.requestUpdate();
    }
  }

  /* eslint-disable indent */
  renderExample(example, paramType, paramName) {
    return html`
      ${paramType === 'array' ? '[' : ''}
      <a
        part="anchor anchor-param-example"
        style="display:inline-block; min-width:24px; text-align:left"
        class="data-example ${this.allowTry === 'true' ? '' : 'inactive-link'}"
        data-example-type="${paramType === 'array' ? paramType : 'string'}"
        data-example="${example.value && Array.isArray(example.value) ? example.value?.join('~|~') : (typeof example.value === 'object' ? JSON.stringify(example.value, null, 2) : example.value) || ''}"
        title="${example.value && Array.isArray(example.value) ? example.value?.join('~|~') : (typeof example.value === 'object' ? JSON.stringify(example.value, null, 2) : example.value) || ''}"
        @click="${(e) => {
          const inputEl = e.target.closest('.request-card').querySelector(`[data-pname="${paramName}"]`);
          if (inputEl) {
            inputEl.value = e.target.dataset.exampleType === 'array' ? e.target.dataset.example.split('~|~') : e.target.dataset.example;
            const requestPanelEl = this.getRequestPanel(e);
            updateCodeExample.call(this, requestPanelEl);
          }
        }}"
      > ${example.printableValue || example.value} </a>
      ${paramType === 'array' ? '] ' : ''}
    `;
  }

  renderShortFormatExamples(examples, paramType, paramName) {
    return html`${examples.map((x, i) => html`
      ${i === 0 ? '' : '┃'}
      ${this.renderExample(x, paramType, paramName)}`)}`;
  }

  renderLongFormatExamples(exampleList, paramType, paramName) {
    return html` <ul style="list-style-type: disclosure-closed;">
      ${exampleList.map((v) => html`
          <li>
            ${this.renderExample(v, paramType, paramName)}
            ${v.summary?.length > 0 ? html`<span>&lpar;${v.summary}&rpar;</span>` : ''}
            ${v.description?.length > 0 ? html`<p>${unsafeHTML(marked(v.description))}</p>` : ''}
          </li>
        `)}
    </ul>`;
  }

  exampleListTemplate(paramName, paramType, exampleList = []) {
    return html` ${
      exampleList.length > 0
        ? html`<span style="font-size:13px;">Example: 
          ${anyExampleWithSummaryOrDescription(exampleList)
            ? this.renderLongFormatExamples(exampleList, paramType, paramName)
            : this.renderShortFormatExamples(exampleList, paramType, paramName)}</span>`
        : ''
      }`;
  }

  inputParametersTemplate(paramType) {
    const filteredParams = this.parameters ? this.parameters.filter((param) => param.in === paramType) : [];
    if (filteredParams.length === 0) {
      return '';
    }
    let title = '';
    if (paramType === 'path') {
      title = 'Path Params';
    } else if (paramType === 'query') {
      title = 'Query-String Params';
    } else if (paramType === 'header') {
      title = 'Headers';
    } else if (paramType === 'cookie') {
      title = 'Cookies';
    }

    const tableRows = [];
    for (const param of filteredParams) {
      const [declaredParamSchema, serializeStyle, mimeTypeElem] = getSchemaFromParam(param);
      if (!declaredParamSchema) {
        continue;
      }
      const paramSchema = getTypeInfo(declaredParamSchema);
      if (!paramSchema) {
        continue; // eslint-disable-line no-continue
      }
      const schemaAsObj = schemaInObjectNotation(declaredParamSchema, {});
      // let exampleVal = '';
      // let exampleList = [];
      let paramStyle = 'form';
      let paramExplode = true;
      let paramAllowReserved = false;
      if (paramType === 'query') {
        if (param.style && 'form spaceDelimited pipeDelimited'.includes(param.style)) {
          paramStyle = param.style;
        } else if (serializeStyle) {
          paramStyle = serializeStyle;
        }
        if (typeof param.explode === 'boolean') {
          paramExplode = param.explode;
        }
        if (typeof param.allowReserved === 'boolean') {
          paramAllowReserved = param.allowReserved;
        }
      }
      // openapi 3.1.0 spec based examples (which must be Object(string : { value:any, summary?: string, description?: string})
      const example = normalizeExamples(
        (param.examples
          || nestExampleIfPresent(param.example)
          || nestExampleIfPresent(mimeTypeElem?.example)
          || mimeTypeElem?.examples
          || nestExampleIfPresent(paramSchema.examples)
          || nestExampleIfPresent(paramSchema.example)
        ),
        paramSchema.type,
      );
      if (!example.exampleVal && paramSchema.type === 'object') {
        example.exampleVal = generateExample(
          declaredParamSchema,
          serializeStyle || 'json',
          '',
          '',
          this.callback === 'true' || this.webhook === 'true' ? true : false, // eslint-disable-line no-unneeded-ternary
          this.callback === 'true' || this.webhook === 'true' ? false : true, // eslint-disable-line no-unneeded-ternary
          true,
          'text',
          false,
        )[0].exampleValue;
      }
      if (!this.resolvedSpec.securitySchemes.some((e) => e.name === param.name)) {
        tableRows.push(html`
              <div class="param-name ${param.deprecated ? 'deprecated' : ''}" >
                ${param.name}

                <div class="param-type">
                  ${paramSchema.type === 'array'
                    ? `${paramSchema.arrayType}`
                    : `${paramSchema.format ? paramSchema.format : paramSchema.type}`
                  }
                  ${param.deprecated ? html`<span style='color:#DC5A41;'>deprecated</span>` : ''}
                  ${param.required ? html`<span style='color:#DC5A41;'>required</span>` : ''}
                </div>
              </div>

              ${this.allowTry === 'true'
                ? html`
                  ${paramSchema.type === 'array'
                    ? html`
                      <tag-input class="request-param" 
                        style = "width:100%" 
                        data-ptype = "${paramType}"
                        data-pname = "${param.name}"
                        data-example = "${Array.isArray(example.exampleVal) ? example.exampleVal.join('~|~') : example.exampleVal}"
                        data-param-serialize-style = "${paramStyle}"
                        data-param-serialize-explode = "${paramExplode}"
                        data-param-allow-reserved = "${paramAllowReserved}"
                        data-array = "true"
                        placeholder = "add-multiple &#x21a9;"
                        .value = "${Array.isArray(example.exampleVal) ? example.exampleVal : example.exampleVal}"
                      >
                      </tag-input>`
                    : paramSchema.type === 'object'
                      ? html`
                        <div class="tab-panel col" style="border-width:0 0 1px 0; margin-top: 24px;">
                          <div class="tab-buttons row" @click="${(e) => {
                            if (e.target.tagName.toLowerCase() === 'button') {
                              const newState = { ...this.activeParameterSchemaTabs };
                              newState[param.name] = e.target.dataset.tab;
                              this.activeParameterSchemaTabs = newState;
                            }
                          }}">
                            <button class="tab-btn ${this.activeParameterSchemaTabs[param.name] !== 'example' ? 'active' : ''}" data-tab = 'schema'>Parameters</button>
                            <button class="tab-btn ${this.activeParameterSchemaTabs[param.name] === 'example' ? 'active' : ''}" data-tab = 'example'>Example </button>
                          </div>
                          ${this.activeParameterSchemaTabs[param.name] === 'example'
                            ? html`<div class="tab-content col">
                              <textarea 
                                class = "textarea request-param"
                                part = "textarea textarea-param"
                                data-ptype = "${paramType}-object"
                                data-pname = "${param.name}"
                                data-example = "${example.exampleVal}"
                                data-param-serialize-style = "${paramStyle}"
                                data-param-serialize-explode = "${paramExplode}"
                                data-param-allow-reserved = "${paramAllowReserved}"
                                spellcheck = "false"
                                .textContent = "${this.fillRequestFieldsWithExample === 'true' ? example.exampleVal : ''}"
                                style = "resize:vertical; width:100%; height: ${'read focused'.includes(this.renderStyle) ? '180px' : '120px'};"
                              ></textarea>
                            </div>`
                            : html`
                              <div class="tab-content col">            
                                <schema-tree
                                  class = 'json'
                                  style = 'display: block'
                                  .data = '${schemaAsObj}'
                                  schema-expand-level = "${this.schemaExpandLevel}"
                                  schema-description-expanded = "${this.schemaDescriptionExpanded}"
                                  allow-schema-description-expand-toggle = "${this.allowSchemaDescriptionExpandToggle}",
                                  schema-hide-read-only = "${this.schemaHideReadOnly.includes(this.method)}"
                                  schema-hide-write-only = "${this.schemaHideWriteOnly.includes(this.method)}"
                                  exportparts = "btn:btn, btn-fill:btn-fill, btn-outline:btn-outline, btn-try:btn-try, btn-clear:btn-clear, btn-clear-resp:btn-clear-resp,
                file-input:file-input, textbox:textbox, textbox-param:textbox-param, textarea:textarea, textarea-param:textarea-param, 
                anchor:anchor, anchor-param-example:anchor-param-example"
                                > </schema-tree>
                              </div>`
                            }
                        </div>`
                      : html`
                        <input type="${paramSchema.format === 'password' ? 'password' : 'text'}" spellcheck="false" style="width:100%" W
                          data-ptype="${paramType}"
                          data-pname="${param.name}" 
                          data-example="${Array.isArray(example.exampleVal) ? example.exampleVal.join('~|~') : example.exampleVal}"
                          data-param-allow-reserved = "${paramAllowReserved}"
                          data-x-fill-example = "${param['x-fill-example'] || 'yes'}"
                          data-array="false"
                          value="${param.schema.default}"
                          @input = ${(e) => {
                            const requestPanelEl = this.getRequestPanel(e);
                            updateCodeExample.call(this, requestPanelEl);
                          }}
                        />`
                    }`
                : ''
              }
              <span class="param-description">${unsafeHTML(marked(param.description || ''))}</span>
              ${this.exampleListTemplate.call(this, param.name, paramSchema.type, example.exampleList)}
            `);
        }
    }

    return html`
    <div class="request-card">
      <div class="request-title-container">
        <div class="request-title">${title}</div>
        <bread-crumbs
          .headers=${[
            {
              title: this.schemaShortSummary,
              link: '.',
            },
            {
              title,
              link: '.',
            },
          ]}
        >
        </bread-crumbs>
      </div>
      <hr style="border-top: 1px solid #E7E9EE;border-bottom:0;margin-block: 24px 0px;">
      <div style="display:block; overflow-x:auto; max-width:100%;padding-inline: 16px;">
        <div style="width:100%; display:flex; flex-direction: column;">
          ${tableRows}
        </div>
      </div>
    </div>`;
  }

  // This method is called before navigation change in focused mode
  async beforeNavigationFocusedMode() {
    // this.saveExampleState();
  }

  // This method is called after navigation change in focused mode
  async afterNavigationFocusedMode() {
    this.selectedRequestBodyType = '';
    this.selectedRequestBodyExample = '';
    this.updateExamplesFromDataAttr();
    this.clearResponseData();
  }

  // Request-Body Event Handlers
  onSelectExample(e) {
    this.selectedRequestBodyExample = e.target.value;
    const exampleDropdownEl = e.target;
    window.setTimeout((selectEl) => {
      const readOnlyExampleEl = selectEl.closest('.example-panel').querySelector('.request-body-param');
      const userInputExampleTextareaEl = selectEl.closest('.example-panel').querySelector('.request-body-param-user-input');
      userInputExampleTextareaEl.value = readOnlyExampleEl.innerText;

      const requestPanelEl = this.getRequestPanel({ target: selectEl });
      updateCodeExample.call(this, requestPanelEl);
    }, 0, exampleDropdownEl);
  }

  onMimeTypeChange(e) {
    this.selectedRequestBodyType = e.target.value;
    const mimeDropdownEl = e.target;
    this.selectedRequestBodyExample = '';
    window.setTimeout((selectEl) => {
      const readOnlyExampleEl = selectEl.closest('.request-body-container').querySelector('.request-body-param');
      if (readOnlyExampleEl) {
        const userInputExampleTextareaEl = selectEl.closest('.request-body-container').querySelector('.request-body-param-user-input');
        userInputExampleTextareaEl.value = readOnlyExampleEl.innerText;
      }
    }, 0, mimeDropdownEl);
  }

  requestBodyTemplate() {
    if (!this.request_body) {
      return '';
    }
    if (Object.keys(this.request_body).length === 0) {
      return '';
    }

    // Variable to store partial HTMLs
    let reqBodyTypeSelectorHtml = '';
    let reqBodyFileInputHtml = '';
    let reqBodyFormHtml = '';
    let reqBodySchemaHtml = '';
    let reqBodyExampleHtml = '';

    const requestBodyTypes = [];
    const { content } = this.request_body;
    for (const mimeType in content) {
      requestBodyTypes.push({
        mimeType,
        schema: content[mimeType].schema,
        example: content[mimeType].example,
        examples: content[mimeType].examples,
      });
      if (!this.selectedRequestBodyType) {
        this.selectedRequestBodyType = mimeType;
      }
    }
    // MIME Type selector
    reqBodyTypeSelectorHtml = requestBodyTypes.length === 1
      ? ''
      : html`
        <select style="min-width:100px; max-width:100%;  margin-bottom:-1px;" @change = '${(e) => this.onMimeTypeChange(e)}'>
          ${requestBodyTypes.map((reqBody) => html`
            <option value = '${reqBody.mimeType}' ?selected = '${reqBody.mimeType === this.selectedRequestBodyType}'>
              ${reqBody.mimeType}
            </option> `)
          }
        </select>
      `;

    // For Loop - Main
    requestBodyTypes.forEach((reqBody) => {
      let schemaAsObj;
      let reqBodyExamples = [];

      if (this.selectedRequestBodyType.includes('json') || this.selectedRequestBodyType.includes('xml') || this.selectedRequestBodyType.includes('text') || this.selectedRequestBodyType.includes('jose')) {
        // Generate Example
        if (reqBody.mimeType === this.selectedRequestBodyType) {
          reqBodyExamples = generateExample(
            reqBody.schema,
            reqBody.mimeType,
            reqBody.examples,
            reqBody.example,
            this.callback === 'true' || this.webhook === 'true' ? true : false, // eslint-disable-line no-unneeded-ternary
            this.callback === 'true' || this.webhook === 'true' ? false : true, // eslint-disable-line no-unneeded-ternary
            'text',
            false,
          );
          if (!this.selectedRequestBodyExample) {
            this.selectedRequestBodyExample = (reqBodyExamples.length > 0 ? reqBodyExamples[0].exampleId : '');
          }
          reqBodyExampleHtml = html`
            ${reqBodyExampleHtml}
            <div class = 'example-panel pad-top-8'>
              ${reqBodyExamples.length === 1
                ? ''
                : html`
                  <select style="min-width:100px; max-width:100%;  margin-bottom:-1px;" @change='${(e) => this.onSelectExample(e)}'>
                    ${reqBodyExamples.map((v) => html`<option value="${v.exampleId}" ?selected=${v.exampleId === this.selectedRequestBodyExample} > 
                      ${v.exampleSummary.length > 80 ? v.exampleId : v.exampleSummary ? v.exampleSummary : v.exampleId} 
                    </option>`)}
                  </select>
                `
              }
              ${reqBodyExamples
                .filter((v) => v.exampleId === this.selectedRequestBodyExample)
                .map((v) => html`
                <div class="example ${v.exampleId === this.selectedRequestBodyExample ? 'example-selected' : ''}" data-example = '${v.exampleId}'>
                  ${v.exampleSummary && v.exampleSummary.length > 80 ? html`<div style="padding: 4px 0"> ${v.exampleSummary} </div>` : ''}
                  ${v.exampleDescription ? html`<div class="m-markdown-small" style="padding: 4px 0"> ${unsafeHTML(marked(v.exampleDescription || ''))} </div>` : ''}
                  <!-- This pre(hidden) is to store the original example value, this will remain unchanged when users switches from one example to another, its is used to populate the editable textarea -->
                  <pre 
                    class = "textarea is-hidden request-body-param ${reqBody.mimeType.substring(reqBody.mimeType.indexOf('/') + 1)}" 
                    spellcheck = "false"
                    data-ptype = "${reqBody.mimeType}" 
                    style="width:100%; resize:vertical; display:none"
                  >${(v.exampleFormat === 'text' ? v.exampleValue : JSON.stringify(v.exampleValue, null, 2))}</pre>

                  <!-- this textarea is for user to edit the example -->
                  <textarea 
                    class = "textarea request-body-param-user-input"
                    part = "textarea textarea-param"
                    spellcheck = "false"
                    data-ptype = "${reqBody.mimeType}" 
                    data-example = "${v.exampleFormat === 'text' ? v.exampleValue : JSON.stringify(v.exampleValue, null, 2)}"
                    data-example-format = "${v.exampleFormat}"
                    style="width:100%; resize:vertical;"
                    .textContent = "${this.fillRequestFieldsWithExample === 'true' ? (v.exampleFormat === 'text' ? v.exampleValue : JSON.stringify(v.exampleValue, null, 2)) : ''}"
                    @input=${(e) => {
                      const requestPanelEl = this.getRequestPanel(e);
                      updateCodeExample.call(this, requestPanelEl);
                    }}
                  ></textarea>
                </div>  
              `)}

            </div>
          `;
        }
      } else if (this.selectedRequestBodyType.includes('form-urlencoded') || this.selectedRequestBodyType.includes('form-data')) {
        if (reqBody.mimeType === this.selectedRequestBodyType) {
          const ex = generateExample(
            reqBody.schema,
            reqBody.mimeType,
            reqBody.examples,
            reqBody.example,
            this.callback === 'true' || this.webhook === 'true' ? true : false, // eslint-disable-line no-unneeded-ternary
            this.callback === 'true' || this.webhook === 'true' ? false : true, // eslint-disable-line no-unneeded-ternary
            'text',
            false,
          );
          if (reqBody.schema) {
            reqBodyFormHtml = this.formDataTemplate(reqBody.schema, reqBody.mimeType, (ex[0] ? ex[0].exampleValue : ''));
          }
        }
      } else if ((/^audio\/|^image\/|^video\/|^font\/|tar$|zip$|7z$|rtf$|msword$|excel$|\/pdf$|\/octet-stream$/.test(this.selectedRequestBodyType))) {
        if (reqBody.mimeType === this.selectedRequestBodyType) {
          reqBodyFileInputHtml = html`
            <div class = "small-font-size bold-text row">
              <input type="file" part="file-input" style="max-width:100%" class="request-body-param-file" data-ptype="${reqBody.mimeType}" spellcheck="false" />
            </div>  
          `;
        }
      }

      // Generate Schema
      if (reqBody.mimeType.includes('json') || reqBody.mimeType.includes('xml') || reqBody.mimeType.includes('text') || this.selectedRequestBodyType.includes('jose')) {
        schemaAsObj = schemaInObjectNotation(reqBody.schema, {});
        if (this.schemaStyle === 'table') {
          reqBodySchemaHtml = html`
            ${reqBodySchemaHtml}
            <schema-table
              class = '${reqBody.mimeType.substring(reqBody.mimeType.indexOf('/') + 1)}'
              style = 'display: ${this.selectedRequestBodyType === reqBody.mimeType ? 'block' : 'none'};'
              .data = '${schemaAsObj}'
              schema-expand-level = "${this.schemaExpandLevel}"
              schema-description-expanded = "${this.schemaDescriptionExpanded}"
              allow-schema-description-expand-toggle = "${this.allowSchemaDescriptionExpandToggle}"
              schema-hide-read-only = "${this.schemaHideReadOnly}"
              schema-hide-write-only = "${this.schemaHideWriteOnly}"
              exportparts = "schema-description:schema-description, schema-multiline-toggle:schema-multiline-toggle"
            > </schema-table>
          `;
        } else if (this.schemaStyle === 'tree') {
          reqBodySchemaHtml = html`
            ${reqBodySchemaHtml}
            <schema-tree
              class = "${reqBody.mimeType.substring(reqBody.mimeType.indexOf('/') + 1)}"
              style = "display: ${this.selectedRequestBodyType === reqBody.mimeType ? 'block' : 'none'};"
              .data = "${schemaAsObj}"
              schema-expand-level = "${this.schemaExpandLevel}"
              schema-description-expanded = "${this.schemaDescriptionExpanded}"
              allow-schema-description-expand-toggle = "${this.allowSchemaDescriptionExpandToggle}"
              schema-hide-read-only = "${this.schemaHideReadOnly}"
              schema-hide-write-only = "${this.schemaHideWriteOnly}"
              exportparts = "schema-description:schema-description, schema-multiline-toggle:schema-multiline-toggle"
            > </schema-tree>
          `;
        }
      }
    });

    return html`
      <div class='request-body-container' data-selected-request-body-type="${this.selectedRequestBodyType}">
        <div class="table-title top-gap row">
          REQUEST BODY ${this.request_body.required ? html`<span class="mono-font" style='color:var(--red)'>*</span>` : ''} 
          <code style = "font-weight:normal; margin-left:5px"> ${this.selectedRequestBodyType}</code>
          <span style="flex:1"></span>
          ${reqBodyTypeSelectorHtml}
        </div>
        ${this.request_body.description ? html`<div class="m-markdown-mal" style="margin-bottom:12px">${unsafeHTML(marked(this.request_body.description))}</div>` : ''}
        
        ${(this.selectedRequestBodyType.includes('json') || this.selectedRequestBodyType.includes('xml') || this.selectedRequestBodyType.includes('text') || this.selectedRequestBodyType.includes('jose'))
          ? html`
            <div class="tab-panel col" style="border-width:0 0 1px 0; margin-top: 24px;">
              <div class="tab-buttons row" @click="${(e) => { if (e.target.tagName.toLowerCase() === 'button') { this.activeSchemaTab = e.target.dataset.tab; } }}">
                <button class="tab-btn ${this.activeSchemaTab !== 'example' ? 'active' : ''}" data-tab = 'schema'>Parameters</button>
                <button class="tab-btn ${this.activeSchemaTab === 'example' ? 'active' : ''}" data-tab = 'example'>Example</button>
              </div>
              <div class="tab-content col" style=${this.activeSchemaTab === 'example' ? 'display:flex;' : 'display:none;'}> ${reqBodyExampleHtml}</div>
              <div class="tab-content col" style=${this.activeSchemaTab === 'example' ? 'display:none;' : 'display:flex;'}> ${reqBodySchemaHtml}</div>
            </div>`
          : html`  
            ${reqBodyFileInputHtml}
            ${reqBodyFormHtml}`
        }
      </div>  
    `;
  }

  formDataParamAsObjectTemplate(fieldName, fieldSchema, mimeType) {
    // This template is used when form-data param should be send as a object (application/json, application/xml)
    const formdataPartSchema = schemaInObjectNotation(fieldSchema, {});
    const formdataPartExample = generateExample(
      fieldSchema,
      'json',
      fieldSchema.examples,
      fieldSchema.example,
      this.callback === 'true' || this.webhook === 'true' ? true : false, // eslint-disable-line no-unneeded-ternary
      this.callback === 'true' || this.webhook === 'true' ? false : true, // eslint-disable-line no-unneeded-ternary
      'text',
      false,
    );

    return html`
      <div class="tab-panel row" style="min-height:220px; border-left: 6px solid var(--light-border-color); align-items: stretch;">
        <div style="width:24px; background-color:var(--light-border-color)">
          <div class="row" style="flex-direction:row-reverse; width:160px; height:24px; transform:rotate(270deg) translateX(-160px); transform-origin:top left; display:block;" @click="${(e) => {
          if (e.target.classList.contains('v-tab-btn')) {
            const { tab } = e.target.dataset;
            if (tab) {
              const tabPanelEl = e.target.closest('.tab-panel');
              const selectedTabBtnEl = tabPanelEl.querySelector(`.v-tab-btn[data-tab="${tab}"]`);
              const otherTabBtnEl = [...tabPanelEl.querySelectorAll(`.v-tab-btn:not([data-tab="${tab}"])`)];
              const selectedTabContentEl = tabPanelEl.querySelector(`.tab-content[data-tab="${tab}"]`);
              const otherTabContentEl = [...tabPanelEl.querySelectorAll(`.tab-content:not([data-tab="${tab}"])`)];
              selectedTabBtnEl.classList.add('active');
              selectedTabContentEl.style.display = 'block';
              otherTabBtnEl.forEach((el) => { el.classList.remove('active'); });
              otherTabContentEl.forEach((el) => { el.style.display = 'none'; });
            }
          }
          if (e.target.tagName.toLowerCase() === 'button') { this.activeSchemaTab = e.target.dataset.tab; }
        }}">
          <button class="v-tab-btn ${this.activeSchemaTab !== 'example' ? 'active' : ''}" data-tab = 'schema'>Parameters</button>
          <button class="v-tab-btn ${this.activeSchemaTab === 'example' ? 'active' : ''}" data-tab = 'example'>Example</button>
        </div>
      </div>
      ${html`
        <div class="tab-content col" data-tab = 'example' style="display:${this.activeSchemaTab === 'example' ? 'block' : 'none'}; padding-left:5px; width:100%"> 
          <textarea 
            class = "textarea"
            part = "textarea textarea-param"
            style = "width:100%; border:none; resize:vertical;" 
            data-array = "false" 
            data-ptype = "${mimeType.includes('form-urlencode') ? 'form-urlencode' : 'form-data'}"
            data-pname = "${fieldName}"
            data-example = "${formdataPartExample[0]?.exampleValue || ''}"
            .textContent = "${this.fillRequestFieldsWithExample === 'true' ? formdataPartExample[0].exampleValue : ''}"
            spellcheck = "false"
          ></textarea>
        </div>`
      }
      ${html`
        <div class="tab-content col" data-tab = 'schema' style="display:${this.activeSchemaTab !== 'example' ? 'block' : 'none'}; padding-left:5px; width:100%;"> 
          <schema-tree
            .data = '${formdataPartSchema}'
            schema-expand-level = "${this.schemaExpandLevel}"
            schema-description-expanded = "${this.schemaDescriptionExpanded}"
            allow-schema-description-expand-toggle = "${this.allowSchemaDescriptionExpandToggle}",
          > </schema-tree>
        </div>`
      }
      </div>
    `;
  }

  formDataTemplate(schema, mimeType, exampleValue = '') {
    const formDataTableRows = [];
    if (schema.properties) {
      for (const fieldName in schema.properties) {
        const fieldSchema = schema.properties[fieldName];
        if (fieldSchema.readOnly) {
          continue;
        }
        const fieldExamples = fieldSchema.examples || fieldSchema.example || '';
        const fieldType = fieldSchema.type;
        const paramSchema = getTypeInfo(fieldSchema);
        const labelColWidth = 'read focused'.includes(this.renderStyle) ? '200px' : '160px';
        const example = normalizeExamples((paramSchema.examples || paramSchema.example), paramSchema.type);
        formDataTableRows.push(html`
        <tr title="${fieldSchema.deprecated ? 'Deprecated' : ''}"> 
          <td style="width:${labelColWidth}; min-width:100px;">
            <div class="param-name ${fieldSchema.deprecated ? 'deprecated' : ''}">
              ${fieldName}${(schema.required?.includes(fieldName) || fieldSchema.required) ? html`<span style='color:var(--red);'>*</span>` : ''}
            </div>
            <div class="param-type">${paramSchema.type}</div>
          </td>  
          <td 
            style="${fieldType === 'object' ? 'width:100%; padding:0;' : this.allowTry === 'true' ? '' : 'display:none;'} min-width:100px;" 
            colspan="${fieldType === 'object' ? 2 : 1}">
            ${fieldType === 'array'
              ? fieldSchema.items?.format === 'binary'
                ? html`
                <div class="file-input-container col" style='align-items:flex-end;' @click="${(e) => this.onAddRemoveFileInput(e, fieldName, mimeType)}">
                  <div class='input-set row'>
                    <input 
                      type = "file"
                      part = "file-input"
                      style = "width:100%" 
                      data-pname = "${fieldName}" 
                      data-ptype = "${mimeType.includes('form-urlencode') ? 'form-urlencode' : 'form-data'}"
                      data-array = "false" 
                      data-file-array = "true" 
                    />
                    <button class="file-input-remove-btn"> &#x2715; </button>
                  </div>  
                  <button class="m-btn primary file-input-add-btn" part="btn btn-fill" style="margin:2px 25px 0 0; padding:2px 6px;">ADD</button>
                </div>  
                `
                : html`
                  <tag-input
                    style = "width:100%" 
                    data-ptype = "${mimeType.includes('form-urlencode') ? 'form-urlencode' : 'form-data'}"
                    data-pname = "${fieldName}"
                    data-example = "${Array.isArray(fieldExamples) ? fieldExamples.join('~|~') : fieldExamples}"
                    data-array = "true"
                    placeholder = "add-multiple &#x21a9;"
                    .value = "${Array.isArray(fieldExamples) ? Array.isArray(fieldExamples[0]) ? fieldExamples[0] : [fieldExamples[0]] : [fieldExamples]}"
                  >
                  </tag-input>
                `
              : html`
                ${fieldType === 'object'
                  ? this.formDataParamAsObjectTemplate.call(this, fieldName, fieldSchema, mimeType)
                  : html`
                    ${this.allowTry === 'true'
                      ? html`<input
                          .value = "${this.fillRequestFieldsWithExample === 'true' ? example.exampleVal : ''}"
                          spellcheck = "false"
                          type = "${fieldSchema.format === 'binary' ? 'file' : fieldSchema.format === 'password' ? 'password' : 'text'}"
                          part = "textbox textbox-param"
                          style = "width:100%"
                          data-ptype = "${mimeType.includes('form-urlencode') ? 'form-urlencode' : 'form-data'}"
                          data-pname = "${fieldName}"
                          data-example = "${Array.isArray(fieldExamples) ? fieldExamples[0] : fieldExamples}"
                          data-array = "false"
                          @input = ${(e) => {
                            const requestPanelEl = this.getRequestPanel(e);
                            updateCodeExample.call(this, requestPanelEl);
                          }}
                        />`
                      : ''
                    }
                    `
                  }`
              }
          </td>
          ${fieldType === 'object'
            ? ''
            : html`
              <td>
                ${paramSchema.default || paramSchema.constrain || paramSchema.allowedValues || paramSchema.pattern
                  ? html`
                    <div class="param-constraint">
                      ${paramSchema.default ? html`<span style="font-weight:bold">Default: </span>${paramSchema.default}<br/>` : ''}
                      ${paramSchema.pattern ? html`<span style="font-weight:bold">Pattern: </span>${paramSchema.pattern}<br/>` : ''}
                      ${paramSchema.constrain ? html`${paramSchema.constrain}<br/>` : ''}
                      ${paramSchema.allowedValues && paramSchema.allowedValues.split('┃').map((v, i) => html`
                        ${i > 0 ? '┃' : html`<span style="font-weight:bold">Allowed: </span>`}
                        ${html`
                          <a part="anchor anchor-param-constraint" class = "${this.allowTry === 'true' ? '' : 'inactive-link'}"
                            data-type="${paramSchema.type === 'array' ? paramSchema.type : 'string'}"
                            data-enum="${v.trim()}"
                            @click="${(e) => {
                              const inputEl = e.target.closest('div').querySelector(`[data-pname="${fieldName}"]`);
                              if (inputEl) {
                                if (e.target.dataset.type === 'array') {
                                  inputEl.value = [e.target.dataset.enum];
                                } else {
                                  inputEl.value = e.target.dataset.enum;
                                }

                                const requestPanelEl = this.getRequestPanel(e);
                                updateCodeExample.call(this, requestPanelEl);
                              }
                            }}"
                          > 
                            ${v} 
                          </a>`
                        }`)
                      }
                    </div>`
                  : ''
                }
              </td>`
          }
        </tr>
        ${fieldType === 'object'
          ? ''
          : html`
            <tr>
              <td style="border:none"> </td>
              <td colspan="2" style="border:none; margin-top:0; padding:0 5px 8px 5px;"> 
                <span class="m-markdown-small">${unsafeHTML(marked(fieldSchema.description || ''))}</span>
                ${this.exampleListTemplate.call(this, fieldName, paramSchema.type, example.exampleList)}
              </td>
            </tr>
          `
        }`);
      }
      return html`
        <table role="presentation" style="width:100%;" class="m-table">
          ${formDataTableRows}
        </table>
      `;
    }

    return html`
      <textarea
        class = "textarea dynamic-form-param ${mimeType}"
        part = "textarea textarea-param"
        spellcheck = "false"
        data-pname="dynamic-form" 
        data-ptype="${mimeType}"
        .textContent = "${exampleValue}"
        style="width:100%"
      ></textarea>
      ${schema.description ? html`<span class="m-markdown-small">${unsafeHTML(marked(schema.description))}</span>` : ''}
    `;
  }

  codeExampleTemplate(display = 'flex') {
    return html`
      <div class="col m-markdown" style="flex:1; display:${display}; position:relative; max-width: 100%;">
        <button class="copy-code" style = "position:absolute; top:12px; right:8px" @click='${(e) => { copyToClipboard(this.codeExample.replace(/\\$/, ''), e); }}' part="btn btn-fill"> ${copySymbol()} </button>
        <pre class="code-container" style="white-space:pre; border: none;"><code>${unsafeHTML(Prism.highlight(this.codeExample.trim().replace(/\\$/, ''), Prism.languages[this.selectedLanguage], this.selectedLanguage))}</code></pre>
      </div>
      `;
  }

  apiResponseTabTemplate() {
    let responseFormat = '';
    let responseContent = '';
    if (!this.responseIsBlob) {
      if (this.responseHeaders.includes('application/x-ndjson')) {
        responseFormat = 'json';
        const prismLines = this.responseText.split('\n').map((q) => Prism.highlight(q, Prism.languages[responseFormat], responseFormat)).join('\n');
        responseContent = html`<code>${unsafeHTML(prismLines)}</code>`;
      } else if (this.responseHeaders.includes('json')) {
        responseFormat = 'json';
        responseContent = html`<code>${unsafeHTML(Prism.highlight(this.responseText, Prism.languages[responseFormat], responseFormat))}</code>`;
      } else if (this.responseHeaders.includes('html') || this.responseHeaders.includes('xml')) {
        responseFormat = 'html';
        responseContent = html`<code>${unsafeHTML(Prism.highlight(this.responseText, Prism.languages[responseFormat], responseFormat))}</code>`;
      } else {
        responseFormat = 'text';
        responseContent = html`<code>${this.responseText}</code>`;
      }
    }
    return html`
      <button class='clear-btn m-btn m-btn-primary' style="margin-bottom: 16px" @click='${this.onTryClick}'>TEST METHOD</button>
      <button class="clear-btn m-btn m-btn-secondary" part="btn btn-outline" @click="${this.clearResponseData}">CLEAR RESPONSE</button>
      <div class="tab-panel col" style="border-top: 1px solid #E7E9EE; border-bottom: 1px solid #E7E9EE; margin-top: 24px;">
        ${this.codeExampleTemplate('flex')}
        <div style="background: #F8F7FC; padding-inline: 32px;padding-block: 16px">
          ${this.responseMessage
              ? html`
                <div class="row" style="width:100%; height:max-content; background:#E7E9EE; border-radius:2px;padding-inline:4px;margin-bottom:4px">
                  <div style="min-width:8px;min-height:8px;width:8px;height:8px;border-radius:50%;${this.responseBlobUrl || this.responseText ? 'border: 1px solid #79A479;background: #E6F2E6;' : 'border: 1px solid #DC4C43;background: #F0E6E4;'}"></div>
                  <div style="margin-left:4px; color:#4A596B; font-size:12px; font-weight:500;">${this.responseMessage}</div>
                </div>`
              : ''
            }
          ${this.responseIsBlob
            ? html`
              <div class="tab-content col" style="flex:1; display:${this.activeResponseTab === 'response' ? 'flex' : 'none'};">
                <button class="m-btn thin-border mar-top-8" style="width:135px" @click='${(e) => { downloadResource(this.responseBlobUrl, this.respContentDisposition, e); }}' part="btn btn-outline">
                  DOWNLOAD
                </button>
                ${this.responseBlobType === 'view'
                  ? html`<button class="m-btn thin-border mar-top-8" style="width:135px"  @click='${(e) => { viewResource(this.responseBlobUrl, e); }}' part="btn btn-outline">VIEW (NEW TAB)</button>`
                  : ''
                }
              </div>`
            : html`
              ${this.responseText ? html`
                <div class="tab-content col m-markdown" style="max-height:500px; flex:1; display:flex;" >
                  <button class="copy-code" style="position:absolute; top:12px; right:16px" @click='${(e) => { copyToClipboard(this.responseText, e); }}' part="btn btn-fill"> ${copySymbol()} </button>
                  <pre style="display:flex; white-space:pre; min-height:50px; height:auto; resize:vertical; overflow:auto">${responseContent}</pre>
                </div>`
                : ''
              }`
          }
        </div>
      </div>`;
  }

  apiCallTemplate() {
    let selectServerDropdownHtml = '';
    if (this.servers && this.servers.length > 0) {
      selectServerDropdownHtml = html`
        <select style="margin-bottom:6px" @change='${(e) => { this.serverUrl = e.target.value; }}'>
          ${this.servers.map((v) => html`<option value = "${v.url}"> ${v.url} - ${v.description} </option>`)}
        </select>
      `;
    }
    const selectedServerHtml = html`
      <div style="display:flex; flex-direction:column;width: 100%;">
        ${selectServerDropdownHtml}
        ${this.serverUrl
          ? html`
            <div style="display:flex; align-items:baseline;">
              <div style="font-weight:bold; padding-right:5px;">API Server</div> 
              <span class = "gray-text"> ${this.serverUrl} </span>
            </div>
          `
          : ''
        }
      </div>  
    `;

    if (!this.resultLoad) {
      this.updateComplete.then(() => {
        const el = this.renderRoot.host.shadowRoot.children[0];
        updateCodeExample.call(this, el.target ? el.target : el);
      });
      this.resultLoad = true;
    } else {
      const el = this.renderRoot.host.shadowRoot.children[0];
      updateCodeExample.call(this, el.target ? el.target : el);
    }

    return html`
    <div style="display:flex; align-items:flex-end; margin:16px 0; font-size:var(--font-size-small);" part="wrap-request-btn">
      <div class="hide-in-small-screen" style="flex-direction:column; margin:0; width:100%;">
        <div style="display:flex; flex-direction:row; align-items:center; overflow:hidden; width: 100%"> 
          ${selectedServerHtml}
        </div>
        <div style="display:flex;">
          <div style="font-weight:bold; padding-right:5px;">Authentication</div>
          ${this.security?.length > 0
            ? html`
              ${this.api_keys.length > 0
                ? html`<div style="color:var(--blue); overflow:hidden;"> 
                    ${this.api_keys.length === 1
                      ? `${this.api_keys[0]?.typeDisplay} in ${this.api_keys[0].in}`
                      : `${this.api_keys.length} API keys applied`
                    } 
                  </div>`
                : html`<div class="gray-text">Required  <span style="color:var(--red)">(None Applied)</span>`
              }`
            : html`<span class="gray-text"> Not Required </span>`
          }
        </div>
      </div>
      <!-- ${
        this.parameters.length > 0 || this.request_body
          ? html`
            <button class="m-btn thin-border" part="btn btn-outline btn-fill" style="margin-right:5px;" @click="${this.onFillRequestData}" title="Fills with example data (if provided)">
              FILL EXAMPLE
            </button>
            <button class="m-btn thin-border" part="btn btn-outline btn-clear" style="margin-right:5px;" @click="${this.onClearRequestData}">
              CLEAR
            </button>`
          : ''
      } 
      <button class="m-btn primary thin-border" part="btn btn-try" @click="${this.onTryClick}">TRY</button>
      -->
    </div>
    `;
  }
  /* eslint-enable indent */

  async onFillRequestData(e) {
    const requestPanelEl = e.target.closest('.request-panel');
    const requestPanelInputEls = [...requestPanelEl.querySelectorAll('input, tag-input, textarea:not(.is-hidden)')];
    requestPanelInputEls.forEach((el) => {
      if (el.dataset.example) {
        if (el.tagName.toUpperCase() === 'TAG-INPUT') {
          el.value = el.dataset.example.split('~|~');
        } else {
          el.value = el.dataset.example;
        }
      }
    });
  }

  async onClearRequestData(e) {
    const requestPanelEl = e.target.closest('.request-panel');
    const requestPanelInputEls = [...requestPanelEl.querySelectorAll('input, tag-input, textarea:not(.is-hidden)')];
    requestPanelInputEls.forEach((el) => { el.value = ''; });
  }

  async onTryClick(e) {
    const tryBtnEl = e.target ? e.target : e;

    const { fetchUrl, fetchOptions, reqHeaders, reqCookie } = updateCodeExample.call(this, tryBtnEl);
    const encodedUrl = `/api/proxy/${encodeURIComponent(fetchUrl)}`;

    this.responseUrl = '';
    this.responseHeaders = [];
    this.responseStatus = 'success';
    this.responseIsBlob = false;

    this.respContentDisposition = '';
    if (this.responseBlobUrl) {
      URL.revokeObjectURL(this.responseBlobUrl);
      this.responseBlobUrl = '';
    }
    if (this.fetchCredentials) {
      fetchOptions.credentials = this.fetchCredentials;
    }
    const controller = new AbortController();
    const { signal } = controller;
    fetchOptions.headers = reqHeaders;
    const tempRequest = { url: encodedUrl, ...fetchOptions };
    this.dispatchEvent(new CustomEvent('before-try', {
      bubbles: true,
      composed: true,
      detail: {
        request: tempRequest,
        controller,
      },
    }));
    const updatedFetchOptions = {
      method: tempRequest.method,
      headers: tempRequest.headers,
      credentials: tempRequest.credentials,
      body: tempRequest.body,
    };

    //fetch uses the cookies in the browser, so we add the needed cookies for the request
    reqCookie.forEach((cookie) => {
      document.cookie = `${cookie.name}=${cookie.value}; path=/`
    })

    const fetchRequest = new Request(tempRequest.url, updatedFetchOptions);
    let fetchResponse;
    let responseClone;
    try {
      let respBlob;
      let respJson;
      let respText;
      tryBtnEl.disabled = true;
      this.responseText = '';
      this.responseMessage = '';
      this.requestUpdate();
      const startTime = performance.now();
      fetchResponse = await fetch(fetchRequest, { signal });
      const endTime = performance.now();
      responseClone = fetchResponse.clone(); // create a response clone to allow reading response body again (response.json, response.text etc)
      tryBtnEl.disabled = false;
      this.responseMessage = html`${fetchResponse.statusText ? `${fetchResponse.statusText}:${fetchResponse.status}` : fetchResponse.status} <div style="color:var(--light-fg)"> Took ${Math.round(endTime - startTime)} milliseconds </div>`;
      this.responseUrl = fetchResponse.url;
      const respHeadersObj = {};
      fetchResponse.headers.forEach((hdrVal, hdr) => {
        respHeadersObj[hdr] = hdrVal;
        this.responseHeaders = `${this.responseHeaders}${hdr}: ${hdrVal}\n`;
      });
      const contentType = fetchResponse.headers.get('content-type');
      const respEmpty = (await fetchResponse.clone().text()).length === 0;
      if (respEmpty) {
        this.responseText = '';
      } else if (contentType) {
        if (contentType === 'application/x-ndjson') {
          this.responseText = await fetchResponse.text();
        } else if (contentType.includes('json')) {
          if ((/charset=[^"']+/).test(contentType)) {
            const encoding = contentType.split('charset=')[1];
            const buffer = await fetchResponse.arrayBuffer();
            try {
              respText = new TextDecoder(encoding).decode(buffer);
            } catch {
              respText = new TextDecoder('utf-8').decode(buffer);
            }
            try {
              respJson = JSON.parse(respText);
              this.responseText = JSON.stringify(respJson, null, 2);
            } catch {
              this.responseText = respText;
            }
          } else {
            respJson = await fetchResponse.json();
            this.responseText = JSON.stringify(respJson, null, 2);
          }
        // eslint-disable-next-line no-useless-escape
        } else if (/^font\/|tar$|zip$|7z$|rtf$|msword$|excel$|\/pdf$|\/octet-stream$|^application\/vnd\./.test(contentType)) {
          this.responseIsBlob = true;
          this.responseBlobType = 'download';
        } else if (/^audio|^image|^video/.test(contentType)) {
          this.responseIsBlob = true;
          this.responseBlobType = 'view';
        } else {
          respText = await fetchResponse.text();
          if (contentType.includes('xml')) {
            this.responseText = formatXml(respText, { textNodesOnSameLine: true, indentor: '  ' });
          } else {
            this.responseText = respText;
          }
        }
        if (this.responseIsBlob) {
          const contentDisposition = fetchResponse.headers.get('content-disposition');
          this.respContentDisposition = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"|'/g, '') : 'filename';
          respBlob = await fetchResponse.blob();
          this.responseBlobUrl = URL.createObjectURL(respBlob);
        }
      } else {
        respText = await fetchResponse.text();
        this.responseText = respText;
      }
      this.dispatchEvent(new CustomEvent('after-try', {
        bubbles: true,
        composed: true,
        detail: {
          request: fetchRequest,
          response: responseClone,
          responseHeaders: respHeadersObj,
          responseBody: respJson || respText || respBlob,
          responseStatus: responseClone.ok,
        },
      }));
    } catch (err) {
      tryBtnEl.disabled = false;
      if (err.name === 'AbortError') {
        this.dispatchEvent(new CustomEvent('request-aborted', {
          bubbles: true,
          composed: true,
          detail: {
            err,
            request: fetchRequest,
          },
        }));
        this.responseMessage = 'Request Aborted';
        this.responseText = 'Request Aborted';
      } else {
        this.dispatchEvent(new CustomEvent('after-try', {
          bubbles: true,
          composed: true,
          detail: {
            err,
            request: fetchRequest,
          },
        }));
        this.responseMessage = `${err.message} (CORS or Network Issue)`;
      }
    }
    this.requestUpdate();

    //now we remove the cookies added
    reqCookie.forEach((cookie) => {
      document.cookie = `${cookie.name}=; path=/`
    })
  }

  getRequestPanel(e) {
    return e.target.closest('.request-panel');
  }

  onAddRemoveFileInput(e, pname, ptype) {
    if (e.target.tagName.toLowerCase() !== 'button') {
      return;
    }

    if (e.target.classList.contains('file-input-remove-btn')) {
      // Remove File Input Set
      const el = e.target.closest('.input-set');
      el.remove();
      return;
    }
    const el = e.target.closest('.file-input-container');

    // Add File Input Set

    // Container
    const newInputContainerEl = document.createElement('div');
    newInputContainerEl.setAttribute('class', 'input-set row');

    // File Input
    const newInputEl = document.createElement('input');
    newInputEl.type = 'file';
    newInputEl.style = 'width:200px; margin-top:2px;';
    newInputEl.setAttribute('data-pname', pname);
    newInputEl.setAttribute('data-ptype', ptype.includes('form-urlencode') ? 'form-urlencode' : 'form-data');
    newInputEl.setAttribute('data-array', 'false');
    newInputEl.setAttribute('data-file-array', 'true');

    // Remover Button
    const newRemoveBtnEl = document.createElement('button');
    newRemoveBtnEl.setAttribute('class', 'file-input-remove-btn');
    newRemoveBtnEl.innerHTML = '&#x2715;';

    newInputContainerEl.appendChild(newInputEl);
    newInputContainerEl.appendChild(newRemoveBtnEl);
    el.insertBefore(newInputContainerEl, e.target);
    // el.appendChild(newInputContainerEl);
  }

  clearResponseData() {
    this.responseUrl = '';
    this.responseHeaders = '';
    this.responseText = '';
    this.responseStatus = 'success';
    this.responseMessage = '';
    this.responseIsBlob = false;
    this.responseBlobType = '';
    this.respContentDisposition = '';
    if (this.responseBlobUrl) {
      URL.revokeObjectURL(this.responseBlobUrl);
      this.responseBlobUrl = '';
    }
  }

  disconnectedCallback() {
    this.codeExample = '';
    // Cleanup ObjectURL for the blob data if this component created one
    if (this.responseBlobUrl) {
      URL.revokeObjectURL(this.responseBlobUrl);
      this.responseBlobUrl = '';
    }
    super.disconnectedCallback();
  }
}

// Register the element with the browser
if (!customElements.get('api-request')) customElements.define('api-request', ApiRequest);
