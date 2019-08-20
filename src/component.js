import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import GithubSlugify from './gh-slugify';
import URL from 'url-parse';

const isHash = /^#/;

/**
 * A react component that wraps [react-markdown](react-markdown) that:
 * -  links all headers with an anchor link.
 * -  resolves all relative links to absolute Github URLs based on the sourceUri of the document.
 *      e.g. /foo/bar.md becomes https://github.mycorp.com/org/component/blob/master/foo/bar.md
 * -  allows the parent component to override the resolved url
 *
 * @class ReactMarkdownGithub
 * @api public
 */
export default class ReactMarkdownGithub extends Component {
  constructor() {
    super(...arguments);
    this.slugify = new GithubSlugify();
    this.transformLinkUri = this.transformLinkUri.bind(this);
    this.renderHeading = this.renderHeading.bind(this);
    this.transformImageUri = this.transformImageUri.bind(this);

    this.state = {};
  }

  /**
   * Parses url into usable github components.
   * @param {String} uri - a valid Github url.
   * @returns {Object} { github, org, repo, filename, filepath, branch }
   * @api private
   */
  static normalizeGithubUrl(uri) {
    const { origin, pathname } = new URL(uri);
    const parts = pathname.split('/');
    const [, org, repo] = parts;
    const filepath = `/${parts.slice(5).join('/')}`;
    const filename = parts[parts.length - 1];
    const branch = parts[4];

    return {
      github: `${origin}/`,
      filepath,
      filename,
      org,
      repo,
      branch
    };
  }

  /**
  * React lifecyle method to ensure that the github url prop is parsed each time
  * it is updated.
  * @param {Object} nextProps - new component props
  * @param {Object} prevState - prior component state
  * @returns {Object} returns new state or null if not modified.
  * @api private
  */
  static getDerivedStateFromProps({ sourceUri }, prevState) {
    if (sourceUri !== prevState.sourceUri) {
      return {
        sourceUri: sourceUri,
        ...ReactMarkdownGithub.normalizeGithubUrl(sourceUri)
      };
    }
    return null;
  }

  /**
  * Converts the passed url until an absolute url. If the passed URL is absolute
  * it will be returned unmodified. If the URL is realitive then it will be
  * merged with the current `sourceUri` property.
  *
  * @param {String} uri - absolute or realitive URL.
  * @returns {url} - will return a absolute URL.
  * @api private
  */
  normalizeLinkUri(uri) {
    // Do not attempt to parse "pure" hashes since they
    // are not fully qualified URLs by definition. This will
    // not work for querystring plus hash, but Github does not
    // support querystring so this is by design.
    if (isHash.test(uri)) {
      return uri;
    }

    const withinFile = new RegExp(`.?/?${this.state.filename}#(.*)$`, 'i');
    const parsed = new URL(uri, this.props.sourceUri);
    const isWithinFile = withinFile.test(uri);

    return isWithinFile
      ? parsed.hash
      : parsed.href;
  }

  /**
  * The callback handler from `ReactMarkdown` .
  *
  * @param {String} uri - Markdown link URL.
  * @param {Object} children - Child Elements of the link.
  * @param {String} title - link title.
  * @returns {url} - will return a absolute URL.
  * @api private
  */
  transformLinkUri(uri, children, title) {
    const { transformLinkUri } = this.props;
    const normalized = this.normalizeLinkUri(uri);
    const opts = { ...this.state, uri: normalized, children, title };
    return transformLinkUri && transformLinkUri(opts) || normalized;
  }

  /**
  * The callback handler from `ReactMarkdown` .
  *
  * @param {String} uri - Markdown image URL.
  * @returns {url} - will return a absolute URL.
  * @api private
  */
  transformImageUri(uri) {
    const { transformImageUri } = this.props;
    const opts = { ...this.state, uri };
    return transformImageUri && transformImageUri(opts) || uri;
  }

  /**
  * The callback handler from `ReactMarkdown` . Generates an `A` anchor link
  * around the Header text
  *
  * @param {Object} props - properties passed from `ReactMarkdown`
  * @param {Int} props.level - The level of the header to render. used for
  * generating <h{1-n}>
  * @param {Array} props.children - Array of strings from the heading
  * @returns {Component} - A react component for the linked header.
  * @api private
  */
  renderHeading(props) {
    const uniqueSlug = this.slugify.slugNode(props.children);

    // eslint-disable-next-line react/no-children-prop
    return React.createElement(`h${props.level}`, {
      id: uniqueSlug,
      className: 'headline-primary',
      children: <a href={ `#${uniqueSlug}` }>
        { props.children }
      </a>
    });
  }

  /**
  * @returns {ReactMarkdown} react tree
  * @api private
  */
  render() {
    const renderers = {
      heading: this.renderHeading,
      ...this.props.renderers
    };
    this.slugify.reset();
    return (
      <ReactMarkdown
        { ...this.props }
        renderers={ renderers }
        transformLinkUri={ this.transformLinkUri }
        transformImageUri={ this.transformImageUri }
      />
    );
  }
}

ReactMarkdownGithub.propTypes = {
  /** {source} The Markdown content to be rendered by `ReactMarkdown` */
  source: PropTypes.string,
  /** {sourceUri} The absolute url to the Github source document. All
   * relative urls will be assumed to be realitve to this file:
   * e.g. https://github.mycorp.com/org/component/blob/master/README.md'
   */
  sourceUri: PropTypes.string,
  /** {transformLinkUri} The callback function executed for each found URL */
  transformLinkUri: PropTypes.func,
  /** {transformImageUri} The callback function executed for each found image */
  transformImageUri: PropTypes.func,
  /** {renderers} the collection of resolvers to pass to `ReactMarkdown` */
  renderers: PropTypes.object,
  /** {className} the css class to to pass to `ReactMarkdown` */
  className: PropTypes.string
};
