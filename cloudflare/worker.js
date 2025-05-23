export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);

    const urlObj = new URL(request.url);

    const location = urlObj.searchParams.get('location');
    const header = urlObj.searchParams.get('header');
    const image = urlObj.searchParams.get('image');
    const theme = urlObj.searchParams.get('theme');
    const map_phone = urlObj.searchParams.get('map_phone');

    const rewriter = new HTMLRewriter();
    handleRewriter(rewriter, [
      { change: header, type: 'header' },
      { change: image, type: 'image' },
      { change: location, type: 'location'},
      { change: map_phone, type: 'map_phone'},
      { change: theme, type: 'theme' },
    ]);
    return rewriter.transform(response);
  },
};

function handleRewriter(rewriter, changes) {
  changes.forEach((item) => {
    if (item.change) {
      switch (item.type) {
        case 'header':
          rewriter.on('[data-header-text]', new ProcessLocationChange(item.change));
          break;
        case 'image':
          rewriter.on('[data-image]', new ProcessAttributeChange('src', item.change));
          break;
        case 'location':
          rewriter.on('[data-header-location]', new ProcessLocationChange(item.change));
          break;
        case 'map_phone':
          rewriter.on('[data-phonenumber]', new ProcessLocationChange('(614) 557-7877'));
          rewriter.on('[data-phonenumber]', new ProcessAttributeChange('href', 'tel:+16145577877'));
          break;
        case 'theme':
          rewriter.on('[data-header-text]', new ProcessAttributeChange('class', item.change))
          break;
      }
    }
  });
}

class ProcessAttributeChange {
  attribute = '';
  content = '';

  constructor(attribute, content) {
    this.attribute = attribute;
    this.content = content;
  }

  element(element) {
    // This gets the value of a particular attribute as a string
    const attribute = element.getAttribute(this.attribute);
    if (attribute) {
      // This sets the attribute on the original element,
      // The second value should be the final string!
      element.setAttribute(this.attribute, this.content);
    }
  }
}

class ProcessLocationChange {
  location = '';

  constructor(location) {
    this.location = location;
  }

  element(element) {
    element.setInnerContent(this.location);
  }
}


class ParamMapping {
  sets = [];

  constructor(urlObject) {
    this.init(urlObject);
  }

  init(urlObject) {
    const params = new URLSearchParams(urlObject.search);
    const paramStringLowercase = params.toString().toLocaleLowerCase();
    const paramPairsLowercase = paramStringLowercase.split('&');
    this.sets = paramPairsLowercase.map((param, index) => {
      const [key, value] = param.split('=');
      return { key, value };
    });
  }

  getKeys() {
    const keys = this.sets.map((set) => {
      return set.key;
    });
    return keys;
  }

  getValue(key) {
    const check = key.toLocaleLowerCase();
    const result = this.sets.find((set) => {
      return set.key === check;
    });
    if (result === undefined) return '';
    return result.value;
  }
}