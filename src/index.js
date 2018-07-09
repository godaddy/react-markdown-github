import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import slugify from 'slugify';
import URL from 'url-parse';

const isHash = /^#/;

/**
 * A react component that wraps [react-markdown](react-markdown) that:
 * -  links all headers with an anchor link.
 * -  resolves all relative links to absolute Github URLs based on the sourceUrl of the document.
 *      e.g. /foo/bar.md becomes https://github.mycorp.com/org/component/blob/master/foo/bar.md
 * -  allows the parent component to override the resolved url
 *
 * @class ReactMarkdownGithub
 * @api public
 */
export default class ReactMarkdownGithub extends Component {
  constructor() {
    super(...arguments);

    this.transformLinkUri = this.transformLinkUri.bind(this);
    this.renderHeading = this.renderHeading.bind(this);
    this.transformImageUri = this.transformImageUri.bind(this);
    this.slugs = {};
    this.state = {};
  }

  /**
   * Parses url into usable github components.
   * @param {String} url - a valid github url.
   * @returns {Object} {github, org, repo, filename}
   * @api private
   */
  static normalizeGithubUrl(url) {
    const { origin, pathname } = new URL(url);
    const parts = pathname.split('/');
    const [, org, repo] = parts;
    const filepath = `/${parts.slice(5).join('/')}`;
    const filename = parts[parts.length - 1];

    return {
      github: `${origin}/`,
      filepath,
      filename,
      org,
      repo
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
  static getDerivedStateFromProps({ sourceUrl }, prevState) {
    if (sourceUrl !== prevState.sourceUrl) {
      return {
        sourceUrl: sourceUrl,
        ...ReactMarkdownGithub.normalizeGithubUrl(sourceUrl)
      };
    }
    return null;
  }

  /**
  * Converts the passed url until an absolute url. If the passed URL is absolute
  * it will be returned unmodified. If the URL is realitive then it will be
  * merged with the current `sourceUrl` property.
  *
  * @param {String} url - url that can be either absolute or realitive.
  * @returns {url} - will return a absolute url.
  * @api private
  */
  normalizeLinkUri(url) {
    // Do not attempt to parse "pure" hashes since they
    // are not fully qualified URLs by definition. This will
    // not work for querystring plus hash, but Github does not
    // support querystring so this is by design.
    if (isHash.test(url)) {
      return url;
    }

    const withinFile = new RegExp(`.?/?${this.state.filename}#(.*)$`, 'i');
    const parsed = new URL(url, this.props.sourceUrl);
    const isWithinFile = withinFile.test(url);

    return isWithinFile
      ? parsed.hash
      : parsed.href;
  }

  /**
  * The callback handler from `ReactMarkdown` .
  *
  * @param {String} url - url
  * @param {Object} children - Child Elements of the link.
  * @param {String} title - link title.
  * @returns {url} - will return a absolute url.
  * @api private
  */
  transformLinkUri(url, children, title) {
    const { resolver } = this.props;
    const normalized = this.normalizeLinkUri(url);
    const opts = { ...this.state, url: normalized, children, title };
    return resolver && resolver(opts) || normalized;
  }

  /**
  * The callback handler from `ReactMarkdown` .
  *
  * @param {String} url - url
  * @returns {url} - will return a absolute url.
  * @api private
  */
  transformImageUri(url) {
    const { transformImageUri } = this.props;
    const opts = { ...this.state, url: url };
    return transformImageUri && transformImageUri(opts) || url;
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
    let title = '';

    props.children.forEach((child) => {
      if (child.props && child.props.children) {
        title += child.props.children + ' ';
      } else {
        title += child;
      }
    });

    const slug = slugify(title, { lower: true });
    let uniqueSlug = slug;

    this.slugs[slug] = this.slugs[slug] || 0;
    if (this.slugs[slug]) {
      uniqueSlug = `${slug}${this.slugs[slug]}`;
    }

    this.slugs[slug] += 1;

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
    const { className, source, resolver } = this.props;
    const renderers = {
      heading: this.renderHeading,
      ...this.props.renderers
    };

    return (
      <ReactMarkdown
        source={ source }
        renderers={ renderers }
        className={ className }
        resolver={ resolver }
        transformLinkUri={ this.transformLinkUri }
        transformImageUri={ this.transformImageUri } />
    );
  }
}


ReactMarkdownGithub.propTypes = {
  /** {source} The Markdown content to be rendered by `ReactMarkdown` */
  source: PropTypes.string,
  /** {sourceUrl} The absolute url to the github repo. All realitive urls will
   * be assumed to be realitve to this file: eg.
   * https://github.mycorp.com/org/component/blob/master/README.md'
   * */
  sourceUrl: PropTypes.string,
  /** {resolver} The callback function executed for each found URL */
  resolver: PropTypes.func,
  /** {transformImageUri} The callback function executed for each found image */
  transformImageUri: PropTypes.func,
  /** {renderers} the collection of resolvers to pass to `ReactMarkdown`  */
  renderers: PropTypes.object,
  /** {className} the css class to to pass to `ReactMarkdown`  */
  className: PropTypes.string
};
