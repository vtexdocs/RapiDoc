import { css } from 'lit';

export default css`
#api-info {
  font-size: calc(var(--font-size-regular) - 1px);
  margin-top: 8px;
}

#api-info span:before {
  content: "|";
  display: inline-block;
  opacity: 0.5;
  width: 15px;
  text-align: center;
}
#api-info span:first-child:before {
  content: "";
  width: 0px;
}

.api-description {
  font-size: 1em;
  line-height: 1.75em;
  width: 100%;
  color: rgb(51, 65, 85);
}

.api-description p,
.api-description span,
.api-description li {
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

.api-description a {
  color: #E31C58;
  text-decoration: none;
  font-weight: 500;
}

.api-description ul {
  padding-left: 1.5em;
  padding-inline-start: 1.5em;
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  list-style-type: disc;
}

.api-description ul li,
.api-description ol li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.api-description ul ul,
.api-description ul ol,
.api-description ol ul,
.api-description ol ol {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.api-description ol {
  padding-left: 1.5em;
  padding-inline-start: 1.5em;
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.api-description header {
  margin-top: 16px;
  border-bottom: 1px solid #E7E9EE;
  margin-bottom: 18px;
  padding-bottom: 18px;
}

.api-description h2,
.api-description h3,
.api-description h4,
.api-description h5,
.api-description h6,
.api-h2 {
  padding-top: 0;
  overflow-wrap: anywhere;
}

.api-description h2,
.api-h2 {
  font-size: 1.375em;
  line-height: 1.3em;
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  margin-block-end: 0.75em;
  color: rgb(15, 23, 42);
}

.api-description h3 {
  font-size: 1.125em;
  font-weight: 600;
  line-height: 1.6em;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  margin-block-end: 0.6em;
}

.api-description h4 {
  font-size: 1em;
  font-weight: 600;
  line-height: 1.5em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  margin-block-end: 0.5em;
  color: rgb(15, 23, 42);
}

.api-description h5 {
  font-size: 0.9375em;
  font-weight: 600;
  line-height: 1.5em;
  margin-top: 1.25em;
  margin-bottom: 0.5em;
  margin-block-end: 0.5em;
  color: rgb(71, 85, 105);
}

.api-description h6 {
  font-size: 0.9375em;
  font-weight: 600;
  line-height: 1.5em;
  margin-top: 1.25em;
  margin-bottom: 0.5em;
  margin-block-end: 0.5em;
  color: rgb(100, 116, 139);
}

.api-description strong {
  font-weight: 600;
  overflow-wrap: break-word;
}

.api-description hr {
  border: 0.5px solid #E7E9EE;
  margin-top: 2em;
  margin-bottom: 2em;
}

@media only screen and (min-width: 40em) {
  .api-description {
    width: auto;
  }

  .api-description h2,
  .api-h2 {
    margin-top: 2em;
    margin-bottom: 1em;
    margin-block-end: 1em;
  }

  .api-description hr {
    margin-top: 3em;
    margin-bottom: 3em;
  }
}
`;
