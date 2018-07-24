/**
 * This RegEx is attempting to copy the Ruby pipeline filter GH uses to add unique ids to headings:
 * https://github.com/jch/html-pipeline/blob/master/lib/html/pipeline/toc_filter.rb
 * The replace isn't perfect as it doesn't correctly handle unicode characters. 
 * This is an area for improvement via future contribution. 
 */

const replace = /[^\w\- ]/g;
const whitespace = /\s/g;

/**
 * A utility class that is used to create 
 * a normalized ID from a string of text:
 * 
 *   `This is my headline` becomes `this-is-my-headline`
 * 
 * This is a statefull object such that duplicate
 * occurances of the same normalized string will have 
 * sequence number apended to them.
 * 
 * Passing `This is my headline` a second time becomes `this-is-my-headline-1`
 * 
 * The normalization process is meant to mimic the headline
 * linking behavior GitHub provides when it renders markdown 
 * to html.
 * 
 * @class GithubSlugify
 * @api public
 */
export default class GithubSlugify {

  constructor() {
    this.slugs = {};
    this.replacementChar = '-';
  }

  /**
   * Convert the passed text into GH Slug.
   * @api private
   * @param {String} string - the txt to be converted to a slug.
   * @returns {String} the text converted to a slug.
   */
  replace(string) {
    return string.toLowerCase().trim()
      .replace(replace, '')
      .replace(whitespace, this.replacementChar);
  }

  /**
   * Generates a GH style slug from the passed text.
   * @api public
   * @param {String} text - the txt to be converted to a slug.
   * @returns {String} the text converted to a slug.
   */
  slug(text) {
    const slug = this.replace(text);
    let uniqueSlug = slug;

    this.slugs[slug] = this.slugs[slug] || 0;
    if (this.slugs[slug]) {
      uniqueSlug = `${slug}-${this.slugs[slug]}`;
    }
    this.slugs[slug] += 1;
    return uniqueSlug;
  }

  /**
   * Resets the state of this object including
   * the tracking of duplicate slugs.
   * @api public
   */
  reset() {
    this.slugs = {};
  }

}
