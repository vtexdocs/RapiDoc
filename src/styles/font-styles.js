import { css } from 'lit';

export default css`
  .hover-bg:hover{
    background: var(--bg3);
  }
  .regular-font{ 
    font-family:var(--font-regular); 
  }
  .mono-font { 
    font-family:var(--font-mono); 
  }
  .title { 
    font-size: calc(var(--font-size-small) + 18px);
    font-weight: normal 
  }
  .sub-title{ font-size: 20px;}
  .req-res-title {
    font-family: var(--font-regular);
    font-size: calc(var(--font-size-small) + 4px);
    margin-bottom:8px;
    text-align:left;
    font-style: normal;
    font-weight: 400;
    line-height: 18px;
  }
  .tiny-title { 
    font-size:calc(var(--font-size-small) + 1px); 
    font-weight:bold; 
  }
  .regular-font-size { font-size: var(--font-size-regular); }
  .small-font-size { font-size: var(--font-size-small); }
  .upper { font-size: 14px; text-transform: uppercase; }
  .operation-tag { font-size: 14px; line-height: 16px; color: #6b7785; margin-top: 0px; padding-top: 0px }
  .primary-text{ color: var(--primary-color); }
  .bold-text { font-weight:bold; }
  .gray-text { color: var(--light-fg); }
  .red-text {color: var(--red)}
  .blue-text {color: var(--blue)}
  .multiline {
    overflow: scroll;
    max-height: var(--resp-area-height, 400px);
    color: var(--fg3);  
  }
  .method-fg.put { color: var(--put-color); }
  .method-fg.post { color: var(--post-color); }
  .method-fg.get { color: var(--get-color); }
  .method-fg.delete { color: var(--delete-color); }
  .method-fg.options, 
  .method-fg.head, 
  .method-fg.patch { 
    color: var(--yellow); 
  }

  h1{ font-family:var(--font-regular); font-size:2em; padding-top: 0.73em; letter-spacing:normal; font-weight:normal; }
  h2{ font-family:var(--font-regular); font-size:1.375em; padding-top: 0.73em; letter-spacing:normal; font-weight:normal; }
  h3{ font-family:var(--font-regular); font-size:1.375em; padding-top: 0.73em; letter-spacing:normal; font-weight:normal; }
  h4{ font-family:var(--font-regular); font-size:1.35em; padding-top: 0.73em; letter-spacing:normal; font-weight:normal; }
  h5{ font-family:var(--font-regular); font-size:1.25em; padding-top: 0.73em; letter-spacing:normal; font-weight:normal; }
  h6{ font-family:var(--font-regular); font-size:1.25em; padding-top: 0.73em; letter-spacing:normal; font-weight:normal; }

  h1,h2,h3,h4,h5,h5{
    margin-block-end: 0.2em;
  }
  a { color: var(--rebel-pink); cursor:pointer; }
  a.inactive-link { 
    color:var(--fg);
    text-decoration: none;
    cursor:text;
  }
  
  code,
  pre {
    margin: 0px;
    font-family: var(--font-mono);
    font-size: calc(var(--font-size-mono) - 1px);
  }

  .m-markdown blockquote,
  .m-markdown-small blockquote,
  .api-description blockquote {
    display: grid;
    box-sizing: border-box;
    padding: 20px;
    gap: 0px 20px;
    width: 100%;
    max-width: 100%;
    margin: 20px 0;
    border-radius: 4px;
    align-items: start;
    grid-template-columns: 20px minmax(0, 1fr);
    background: #f8f7fc;
    border: 1px solid #ccced8;
  }

  .m-markdown .info-blockquote,
  .m-markdown-small .info-blockquote,
  .api-description .info-blockquote {
    background: #f8f7fc;
    border: 1px solid #ccced8;
  }

  .m-markdown .callout-icon,
  .m-markdown-small .callout-icon,
  .api-description .callout-icon {
    display: inline-block;
    flex-shrink: 0;
    grid-column: 1;
    grid-row: 1;
  }

  .m-markdown .warning-blockquote,
  .m-markdown-small .warning-blockquote,
  .api-description .warning-blockquote,
  .m-markdown blockquote.warning,
  .m-markdown-small blockquote.warning,
  .api-description blockquote.warning {
    background: #fff2d4;
    border: 1px solid #ffb100;
  }

  .m-markdown .danger-blockquote,
  .m-markdown-small .danger-blockquote,
  .api-description .danger-blockquote,
  .m-markdown blockquote.danger,
  .m-markdown-small blockquote.danger,
  .api-description blockquote.danger {
    background: #fdefef;
    border: 1px solid #dc5a41;
  }

  .m-markdown blockquote > :not(.callout-icon),
  .m-markdown-small blockquote > :not(.callout-icon),
  .api-description blockquote > :not(.callout-icon) {
    grid-column: 2 / -1;
    min-width: 0;
    overflow-wrap: break-word;
    margin: 0;
  }

  .m-markdown blockquote h3,
  .m-markdown-small blockquote h3 {
    padding: 0;
    font-size: var(--font-size-regular);
    font-weight: 600;
    line-height: 1.375em;
  }

  .m-markdown,
  .m-markdown-small {
    display:block;
  }

  .m-markdown p,
  .m-markdown span {
    font-size: var(--font-size-regular);
    line-height: 1.375em;
  }
  .m-markdown li {
    font-size: var(--font-size-regular);
    line-height:calc(var(--font-size-regular) + 10px);
  }
  
  .m-markdown-small p,
  .m-markdown-small span,
  .m-markdown-small li {
    font-size: var(--font-size-small);
    line-height: calc(var(--font-size-small) + 6px);
  }
  .m-markdown-small li {
    line-height: calc(var(--font-size-small) + 8px);
  }

  code {
    background-color: #f6f8fa;
    border-radius: 4px;
    margin: 0;
    padding: 0.2em 0.4em;
  }

  .m-markdown code span {
    font-size: 12px;
  }

  .m-markdown-small code {
    font-size: calc(var(--font-size-mono) - 1px);
  }

  .m-markdown-small pre,
  .m-markdown pre {
    overflow-x: auto;
    line-height: normal;
    border-radius: 2px;
    font-size: 14px;
    border: 1px solid var(--code-border-color);
  }

  .m-markdown pre {
    padding: 14px;
    background-color: #F8F7FC;
    border: 1px solid #E7E9EE;
    color:var(--code-fg);
  }

  .m-markdown-small pre {
    margin-top: 4px;
    padding: 2px 4px;
    background-color: var(--bg3);
    color: var(--fg2);
  }

  .m-markdown-small pre code,
  .m-markdown pre code {
    border:none;
    padding:0;
  }

  .m-markdown pre code {
    color: #DC5A41;
    background-color: var(--code-bg);
    background-color: transparent;
  }

  .m-markdown-small pre code {
    color: var(--fg2);
    background-color: var(--bg3);
  }

  .m-markdown ul,
  .m-markdown ol {
    padding-inline-start: 30px;
  }

  .m-markdown-small ul,
  .m-markdown-small ol {
    padding-inline-start: 20px;
  }

  .m-markdown-small a,
  .m-markdown a {
    color:var(--rebel-pink);
    text-decoration: none;
  }

  .m-markdown-small img,
  .m-markdown img { 
    max-width: 100%; 
  }

  /* Markdown table */

  table {
  width: 100%;
  table-layout: auto;
  text-align: left;
  margin: 1.5em 0;
  font-size: 0.875em;
  line-height: 1.7em;
  border-collapse: collapse; 
}

table thead {
  border-bottom: 1px solid #cbd5e1; 
}

table thead th {
  font-weight: 600;
  color: rgb(15, 23, 42); 
  text-align: left;
  vertical-align: bottom;
  padding: 0 0.75em 0.75em 0.75em;
}

table thead th:first-of-type {
  padding-left: 0;
}

table tbody tr {
  border-bottom: 1px solid #e2e8f0;
}

table tbody tr:last-of-type {
  border-bottom: none; 
}

table tbody td {
  vertical-align: baseline;
  padding: 0.75em;
}

table tbody td:first-of-type {
  padding-left: 0;
}

table td,
table th {
  min-width: 60px;
}

  .m-markdown hr{
    border: 1px solid var(--border-color);
  }
`;
