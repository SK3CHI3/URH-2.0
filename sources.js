/**
 * Source configuration for the resource scraper.
 * Contains detailed selectors and settings for each resource source.
 */

module.exports = {
  // TECHNOLOGY - Programming and tech resources
  technology: [
    {
      name: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/news',
      selector: '.post-card',
      titleSelector: '.post-card-title a',
      descriptionSelector: '.post-card-excerpt',
      imageSelector: '.post-card-image',
      category: 'Technology',
      tags: ['Programming', 'Web Development']
    },
    {
      name: 'DEV.to',
      url: 'https://dev.to/',
      selector: '.crayons-story',
      titleSelector: 'h2.crayons-story__title a',
      descriptionSelector: '.crayons-story__snippet',
      imageSelector: '.crayons-story__cover img',
      category: 'Technology',
      tags: ['Programming', 'Web Development', 'Community'],
      requiresRendering: true
    },
    {
      name: 'CSS-Tricks',
      url: 'https://css-tricks.com',
      selector: 'article.article-card',
      titleSelector: 'h2.article-card__title a',
      descriptionSelector: '.article-card__excerpt',
      imageSelector: '.article-card__image',
      category: 'Technology',
      tags: ['CSS', 'Web Development', 'Frontend']
    },
    {
      name: 'hackr.io',
      url: 'https://hackr.io/blog',
      selector: '.post-item',
      titleSelector: '.entry-title a',
      descriptionSelector: '.entry-content p',
      imageSelector: '.post-thumbnail img',
      category: 'Technology',
      tags: ['Programming', 'Tutorials', 'Learning']
    }
  ],
  
  // DESIGN - UI/UX design resources and inspiration
  design: [
    {
      name: 'Smashing Magazine',
      url: 'https://www.smashingmagazine.com/articles/',
      selector: '.article--post',
      titleSelector: '.article--post__title a',
      descriptionSelector: '.article--post__teaser',
      imageSelector: '.article--post__image img',
      category: 'Design',
      tags: ['UI Design', 'UX Design']
    },
    {
      name: 'Dribbble Blog',
      url: 'https://dribbble.com/stories',
      selector: '.articles-grid-item',
      titleSelector: '.articles-grid-item-title',
      descriptionSelector: '.articles-grid-item-excerpt',
      imageSelector: '.articles-grid-item-thumb img',
      category: 'Design',
      tags: ['Design', 'Inspiration', 'UI']
    },
    {
      name: 'Behance Blog',
      url: 'https://www.behance.net/blog',
      selector: 'article.ContentCard',
      titleSelector: 'h3.ContentCard-title',
      descriptionSelector: '.ContentCard-description',
      imageSelector: '.ContentCard-image img',
      category: 'Design',
      tags: ['Creative', 'Portfolio', 'Design Trends']
    },
    {
      name: 'Design Shack',
      url: 'https://designshack.net',
      selector: 'article.post',
      titleSelector: 'h2.entry-title a',
      descriptionSelector: '.entry-content p',
      imageSelector: '.post-thumbnail img',
      category: 'Design',
      tags: ['Design Tips', 'Web Design', 'Inspiration']
    }
  ],
  
  // BUSINESS - Entrepreneurship and business resources
  business: [
    {
      name: 'Entrepreneur',
      url: 'https://www.entrepreneur.com/latest',
      selector: '.entrepreneur-landing-card',
      titleSelector: '.entrepreneur-landing-card__title',
      descriptionSelector: '.entrepreneur-landing-card__description',
      imageSelector: '.entrepreneur-landing-card__image',
      category: 'Business',
      tags: ['Entrepreneurship', 'Business'],
      requiresRendering: true
    },
    {
      name: 'Y Combinator Blog',
      url: 'https://www.ycombinator.com/blog',
      selector: '.post-card-container',
      titleSelector: '.post-card-title',
      descriptionSelector: '.post-card-description',
      imageSelector: '.post-card-image',
      category: 'Business',
      tags: ['Startups', 'Venture Capital', 'Business']
    },
    {
      name: 'Forbes Small Business',
      url: 'https://www.forbes.com/small-business/',
      selector: 'article.stream-item',
      titleSelector: '.stream-item__title',
      descriptionSelector: '.stream-item__description',
      imageSelector: '.stream-item__image',
      category: 'Business',
      tags: ['Small Business', 'Entrepreneurship', 'Finance'],
      requiresRendering: true
    },
    {
      name: 'Indie Hackers',
      url: 'https://www.indiehackers.com',
      selector: '.feed-item',
      titleSelector: '.feed-item__title-link',
      descriptionSelector: '.feed-item__content-wrapper',
      imageSelector: '.feed-item__image',
      category: 'Business',
      tags: ['Bootstrapping', 'Startups', 'Indie Business'],
      requiresRendering: true
    }
  ],
  
  // EDUCATION - Focus on Udemy free courses as requested
  education: [
    // Keep the sites you mentioned
    {
      name: 'GeeksGod',
      url: 'https://geeksgod.com/category/free-courses/',
      selector: '.article-content',
      titleSelector: '.entry-title a',
      descriptionSelector: '.entry-content p',
      imageSelector: '.wp-post-image',
      category: 'Education',
      tags: ['Udemy', 'Course', 'Free'],
      relevanceKeywords: ['udemy', 'free', 'course', 'coupon', '100% off'],
      irrelevanceKeywords: ['job', 'hiring', 'internship', 'recruitment'],
      requiresTwoStepScraping: true,
      linkSelector: '.entry-title a',
      enrollButtonSelector: '.wp-block-button__link, a.btn-enroll, a[href*="udemy.com/course"]',
      enrollLinkPattern: /https:\/\/www\.udemy\.com\/course\/.*?\?couponCode=.*/i
    },
    {
      name: 'UdemyFreebies',
      url: 'https://www.udemyfreebies.com/',
      selector: '.coupon-detail',
      titleSelector: 'h4 a',
      descriptionSelector: '.coupon-description',
      imageSelector: '.coupon-image img',
      category: 'Education',
      tags: ['Udemy', 'Course', 'Free'],
      requiresTwoStepScraping: true,
      linkSelector: 'h4 a',
      enrollButtonSelector: 'a.coupon-code-link, a.btn-enroll, a[href*="udemy.com/course"]',
      enrollLinkPattern: /https:\/\/www\.udemy\.com\/course\/.*?\?couponCode=.*/i
    },
    {
      name: 'UdemyKing',
      url: 'https://www.udemyking.com/',
      selector: 'article.post',
      titleSelector: 'h2.entry-title a',
      descriptionSelector: '.entry-content p',
      imageSelector: '.wp-post-image',
      category: 'Education',
      tags: ['Udemy', 'Course', 'Free'],
      relevanceKeywords: ['udemy', 'free', 'course', 'coupon', '100% off'],
      requiresTwoStepScraping: true,
      linkSelector: 'h2.entry-title a',
      enrollButtonSelector: '.wp-block-button__link, a.fasc-button, a.btn-direct',
      enrollLinkPattern: /https:\/\/www\.udemy\.com\/course\/.*?\?couponCode=.*/i
    },
    // Additional Udemy sources
    {
      name: 'DiscUdemy',
      url: 'https://www.discudemy.com/all',
      selector: '.content',
      titleSelector: '.card-header',
      descriptionSelector: '.description',
      imageSelector: '.ui.image img',
      category: 'Education',
      tags: ['Udemy', 'Course', 'Free'],
      requiresTwoStepScraping: true,
      linkSelector: 'a.card-header',
      enrollButtonSelector: 'a.ui.button',
      enrollLinkPattern: /https:\/\/www\.udemy\.com\/course\/.*?\?couponCode=.*/i
    },
    {
      name: 'Real.Discount',
      url: 'https://real.discount/filter?category=All&certify=All&duration=0&language=All&price=free&subcategory=All&store=Udemy',
      selector: '.card',
      titleSelector: '.card-title a',
      descriptionSelector: '.card-text',
      imageSelector: '.card-img-top',
      category: 'Education',
      tags: ['Udemy', 'Course', 'Free'],
      relevanceKeywords: ['free', 'udemy', 'course'],
      requiresTwoStepScraping: true,
      linkSelector: '.card-title a',
      enrollButtonSelector: '.btn-primary',
      enrollLinkPattern: /https:\/\/www\.udemy\.com\/course\/.*?\?couponCode=.*/i
    }
  ],
  
  // EVENTS - Tech events and conferences
  events: [
    {
      name: 'Eventbrite Tech',
      url: 'https://www.eventbrite.com/d/online/free--events--this-week/technology/',
      selector: '.eds-event-card-content',
      titleSelector: '.eds-event-card-content__title',
      descriptionSelector: '.eds-event-card-content__sub',
      imageSelector: '.eds-event-card-content__image',
      category: 'Events',
      tags: ['Technology', 'Conference', 'Workshop'],
      requiresRendering: true
    },
    {
      name: 'Meetup Tech',
      url: 'https://www.meetup.com/find/?keywords=technology&source=EVENTS&categoryId=546',
      selector: '.event-card',
      titleSelector: '.event-card-title',
      descriptionSelector: '.event-card-info',
      imageSelector: '.event-card-image',
      category: 'Events',
      tags: ['Technology', 'Networking', 'Community'],
      requiresRendering: true
    },
    {
      name: 'Hackathon.io',
      url: 'https://www.hackathon.io/events',
      selector: '.event-teaser',
      titleSelector: '.event-teaser-title a',
      descriptionSelector: '.event-teaser-description',
      imageSelector: '.event-teaser-image img',
      category: 'Events',
      tags: ['Hackathon', 'Competition', 'Coding']
    },
    {
      name: 'DevEvents',
      url: 'https://dev.events/',
      selector: '.event-card',
      titleSelector: '.event-card__title',
      descriptionSelector: '.event-card__description',
      imageSelector: '.event-card__image',
      category: 'Events',
      tags: ['Developer Events', 'Conference', 'Technology'],
      requiresRendering: true
    }
  ],
  
  // BLOGS & NEWS - Tech news and industry blogs
  blogsAndNews: [
    {
      name: 'TechCrunch',
      url: 'https://techcrunch.com/',
      selector: 'article.post-block',
      titleSelector: 'h2 a',
      descriptionSelector: '.post-block__content',
      imageSelector: 'img.post-block__media',
      category: 'Blogs & News',
      tags: ['Tech News', 'Startups', 'Industry']
    },
    {
      name: 'The Verge',
      url: 'https://www.theverge.com/',
      selector: '.c-entry-box--compact',
      titleSelector: 'h2.c-entry-box--compact__title a',
      descriptionSelector: '.c-entry-box--compact__dek',
      imageSelector: '.c-entry-box--compact__image img',
      category: 'Blogs & News',
      tags: ['Tech News', 'Reviews', 'Analysis']
    },
    {
      name: 'Wired',
      url: 'https://www.wired.com/',
      selector: '.summary-item',
      titleSelector: '.summary-item__hed',
      descriptionSelector: '.summary-item__dek',
      imageSelector: '.summary-item__image img',
      category: 'Blogs & News',
      tags: ['Technology', 'Culture', 'Science'],
      requiresRendering: true
    },
    {
      name: 'Hacker News',
      url: 'https://news.ycombinator.com/',
      selector: '.athing',
      titleSelector: '.titleline > a',
      // HN doesn't have descriptions in the list view, so we provide a function
      descriptionSelector: function($, el) {
        return 'A curated article from the tech community';
      },
      imageSelector: null, // No images on HN
      category: 'Blogs & News',
      tags: ['Programming', 'Startups', 'Tech Discussion']
    }
  ]
}; 