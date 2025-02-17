import { css } from 'lit';

export default css`

*, *:before, *:after { box-sizing: border-box; }

.tr {
  display: flex;
  flex: none;
  width: 100%;
  box-sizing: content-box;
  border-bottom: 1px dotted transparent;
  transition: max-height 0.3s ease-out;
}
.td {
  display: block;
  flex: 0 0 auto;
}
.key {
  font-family: var(--font-mono);
  white-space: normal;
  word-break: break-all;
}

.collapsed-all-descr .key {
  overflow:hidden;
}
.expanded-all-descr .key-descr .descr-expand-toggle {
  display:none;
}

.key-descr .descr-expand-toggle {
  display:inline-block;
  user-select:none;
  color: var(--fg);
  cursor: pointer;
  transform: rotate(45deg);
  transition: transform .2s ease;
}

.expanded-descr .key-descr .descr-expand-toggle {
  transform: rotate(270deg)
}

.key-descr .descr-expand-toggle:hover {
  color: var(--primary-color);
}

.expanded-descr .more-content { display:none; }

.key-descr {
  font-family:var(--font-regular);
  color:#4A4A4A;
  flex-shrink: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-left: 10px;
}
.expanded-descr .key-descr{
  max-height:auto;
  overflow:hidden;
  display: none;
}

.xxx-of-key {
  font-family: var(--font-mono);
  font-size: 12px; 
  font-weight:bold; 
  background-color:#f8f7fc; 
  border-radius:4px;
  line-height:calc(var(--font-size-small) + 6px);
  padding: 0.2em 0.4em;
  margin-bottom:1px; 
  display:inline-block;
}

.xxx-of-descr {
  font-family: var(--font-regular);
  color: var(--primary-color);
  font-size: calc(var(--font-size-small) - 1px);
  margin-left: 2px;
}

.stri, .string, .uri, .url, .byte, .bina, .date, .pass, .ipv4, .ipv4, .uuid, .emai, .host {
  color:var(--green);
  font-family: var(--font-mono);
  font-size: var(--font-size-mono);
}
.inte, .numb, .number, .int6, .int3, .floa, .doub, .deci .blue {
  color:var(--blue);
  font-family: var(--font-mono);
  font-size: var(--font-size-mono);
}
.null {color:var(--red);
  font-family: var(--font-mono);
  font-size: var(--font-size-mono);
}
.bool, .boolean{
  color:var(--orange);
  font-family: var(--font-mono);
  font-size: var(--font-size-mono);
}
.enum, .cons {
  color:var(--purple);
  font-family: var(--font-mono);
  font-size: var(--font-size-mono);
}
.recu {color:var(--brown)}
.toolbar {
  display:flex;
  width:100%;
  padding: 2px 0;
  color:var(--primary-color);
}
.toolbar-item {
  cursor:pointer;
  padding:5px 0;
  margin:0 2px;
}
.schema-root-type {
  cursor:auto;
  color:var(--fg2);
  font-weight: bold;
  text-transform: uppercase;
}
.toolbar-item:first-of-type { margin:0 2px 0 0;}

@media only screen and (min-width: 500px) {
  .key-descr {
    display: block;
  }
  .expanded-descr .key-descr{
    display: block;
  }
}
`;
