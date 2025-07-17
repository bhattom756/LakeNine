import weaviate, { ApiKey } from 'weaviate-ts-client';

// Initialize Weaviate client
const getWeaviateClient = () => {
  // Verify environment variables are set
  if (!process.env.WEAVIATE_HOST || !process.env.WEAVIATE_API_KEY) {
    throw new Error('Missing Weaviate environment variables');
  }

  const client = weaviate.client({
    scheme: 'https',
    host: process.env.WEAVIATE_HOST,
    apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
    headers: {
      'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
    },
  });
  
  return client;
};

// Retrieve relevant components based on user query
export async function retrieveComponents(query: string, limit: number = 10) {
  try {
    const client = getWeaviateClient();
    
    const response = await client.graphql
      .get()
      .withClassName('WebComponent')
      .withFields('type description code')
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();
    
    return response.data.Get.WebComponent;
  } catch (error) {
    console.error('Error retrieving components from Weaviate:', error);
    // Return empty array instead of throwing
    return [];
  }
}

// Retrieve components by type and description
export async function retrieveComponentsByTypeAndDescription(query: string, type: string, description?: string, limit: number = 3) {
  try {
    const client = getWeaviateClient();
    
    const operands: any[] = [
      {
        path: ['type'],
        operator: 'Equal',
        valueString: type
      }
    ];

    if (description) {
      operands.push({
        path: ['description'],
        operator: 'Equal',
        valueString: description
      });
    }
    
    const response = await client.graphql
      .get()
      .withClassName('WebComponent')
      .withFields('type description code')
      .withWhere({
        operator: 'And',
        operands: operands
      })
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();
    
    return response.data.Get.WebComponent;
  } catch (error) {
    console.error(`Error retrieving ${type} components from Weaviate:`, error);
    return [];
  }
}

// Get components for a complete website based on user query
export async function getWebsiteComponents(query: string) {
  try {
    // Get general components first
    const generalComponents = await retrieveComponents(query, 10);
    
    // Get specific component types without overly strict descriptions
    const heroComponents = await retrieveComponentsByTypeAndDescription(query, 'hero');
    const navbarComponents = await retrieveComponentsByTypeAndDescription(query, 'navbar');
    const featuresComponents = await retrieveComponentsByTypeAndDescription(query, 'features');
    const footerComponents = await retrieveComponentsByTypeAndDescription(query, 'footer');
    const testimonialsComponents = await retrieveComponentsByTypeAndDescription(query, 'testimonials');
    const pricingComponents = await retrieveComponentsByTypeAndDescription(query, 'pricing');
    const ctaComponents = await retrieveComponentsByTypeAndDescription(query, 'cta');
    const statsComponents = await retrieveComponentsByTypeAndDescription(query, 'stats');
    const teamComponents = await retrieveComponentsByTypeAndDescription(query, 'team');
    const contactComponents = await retrieveComponentsByTypeAndDescription(query, 'contact');
    const faqComponents = await retrieveComponentsByTypeAndDescription(query, 'faq');
    const galleryComponents = await retrieveComponentsByTypeAndDescription(query, 'gallery');
    const blogComponents = await retrieveComponentsByTypeAndDescription(query, 'blog');
    const newsletterComponents = await retrieveComponentsByTypeAndDescription(query, 'newsletter');

    // Add all the new component types requested by the user, without overly strict descriptions where not needed
    const bentoGridsComponents = await retrieveComponentsByTypeAndDescription(query, 'bento grid');
    const headerSectionsComponents = await retrieveComponentsByTypeAndDescription(query, 'header');
    const contactSectionsComponents = await retrieveComponentsByTypeAndDescription(query, 'contact');
    const teamSectionsComponents = await retrieveComponentsByTypeAndDescription(query, 'team');
    const contentSectionsComponents = await retrieveComponentsByTypeAndDescription(query, 'content');
    const logoCloudsComponents = await retrieveComponentsByTypeAndDescription(query, 'logo cloud');
    const faqsComponents = await retrieveComponentsByTypeAndDescription(query, 'faq');
    const headersComponents = await retrieveComponentsByTypeAndDescription(query, 'header');
    const flyoutMenusComponents = await retrieveComponentsByTypeAndDescription(query, 'flyout menu');
    const bannersComponents = await retrieveComponentsByTypeAndDescription(query, 'banner');
    const notFoundPagesComponents = await retrieveComponentsByTypeAndDescription(query, '404 page');
    const landingPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'landing page');
    const pricingPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'pricing page');
    const aboutPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'about page');
    const stackedLayoutsComponents = await retrieveComponentsByTypeAndDescription(query, 'stacked layout');
    const sidebarLayoutsComponents = await retrieveComponentsByTypeAndDescription(query, 'sidebar layout');
    const multiColumnLayoutsComponents = await retrieveComponentsByTypeAndDescription(query, 'multi-column layout');
    const pageHeadingsComponents = await retrieveComponentsByTypeAndDescription(query, 'page heading');
    const cardHeadingsComponents = await retrieveComponentsByTypeAndDescription(query, 'card heading');
    const sectionHeadingsComponents = await retrieveComponentsByTypeAndDescription(query, 'section heading');
    const descriptionListsComponents = await retrieveComponentsByTypeAndDescription(query, 'description list');
    const calendarsComponents = await retrieveComponentsByTypeAndDescription(query, 'calendar');
    const stackedListsComponents = await retrieveComponentsByTypeAndDescription(query, 'stacked list');
    const tablesComponents = await retrieveComponentsByTypeAndDescription(query, 'table');
    const gridListsComponents = await retrieveComponentsByTypeAndDescription(query, 'grid list');
    const feedsComponents = await retrieveComponentsByTypeAndDescription(query, 'feed');
    const formLayoutsComponents = await retrieveComponentsByTypeAndDescription(query, 'form layout');
    const inputGroupsComponents = await retrieveComponentsByTypeAndDescription(query, 'input group');
    const selectMenusComponents = await retrieveComponentsByTypeAndDescription(query, 'select menu');
    const signInRegistrationComponents = await retrieveComponentsByTypeAndDescription(query, 'sign-in and registration');
    const textareasComponents = await retrieveComponentsByTypeAndDescription(query, 'textarea');
    const radioGroupsComponents = await retrieveComponentsByTypeAndDescription(query, 'radio group');
    const checkboxesComponents = await retrieveComponentsByTypeAndDescription(query, 'checkbox');
    const togglesComponents = await retrieveComponentsByTypeAndDescription(query, 'toggle');
    const actionPanelsComponents = await retrieveComponentsByTypeAndDescription(query, 'action panel');
    const comboboxesComponents = await retrieveComponentsByTypeAndDescription(query, 'combobox');
    const alertsComponents = await retrieveComponentsByTypeAndDescription(query, 'alert');
    const emptyStatesComponents = await retrieveComponentsByTypeAndDescription(query, 'empty state');
    const navbarsComponents = await retrieveComponentsByTypeAndDescription(query, 'navbar');
    const paginationComponents = await retrieveComponentsByTypeAndDescription(query, 'pagination');
    const tabsComponents = await retrieveComponentsByTypeAndDescription(query, 'tab');
    const verticalNavigationComponents = await retrieveComponentsByTypeAndDescription(query, 'vertical navigation');
    const sidebarNavigationComponents = await retrieveComponentsByTypeAndDescription(query, 'sidebar navigation');
    const breadcrumbsComponents = await retrieveComponentsByTypeAndDescription(query, 'breadcrumb');
    const progressBarsComponents = await retrieveComponentsByTypeAndDescription(query, 'progress bar');
    const commandPalettesComponents = await retrieveComponentsByTypeAndDescription(query, 'command palette');
    const modalDialogsComponents = await retrieveComponentsByTypeAndDescription(query, 'modal dialog');
    const drawersComponents = await retrieveComponentsByTypeAndDescription(query, 'drawer');
    const notificationsComponents = await retrieveComponentsByTypeAndDescription(query, 'notification');
    const avatarsComponents = await retrieveComponentsByTypeAndDescription(query, 'avatar');
    const badgesComponents = await retrieveComponentsByTypeAndDescription(query, 'badge');
    const dropdownsComponents = await retrieveComponentsByTypeAndDescription(query, 'dropdown');
    const buttonsComponents = await retrieveComponentsByTypeAndDescription(query, 'button');
    const buttonGroupsComponents = await retrieveComponentsByTypeAndDescription(query, 'button group');
    const containersComponents = await retrieveComponentsByTypeAndDescription(query, 'container');
    const cardsComponents = await retrieveComponentsByTypeAndDescription(query, 'card');
    const listContainersComponents = await retrieveComponentsByTypeAndDescription(query, 'list container');
    const mediaObjectsComponents = await retrieveComponentsByTypeAndDescription(query, 'media object');
    const dividersComponents = await retrieveComponentsByTypeAndDescription(query, 'divider');
    const homeScreensComponents = await retrieveComponentsByTypeAndDescription(query, 'home screen');
    const detailScreensComponents = await retrieveComponentsByTypeAndDescription(query, 'detail screen');
    const settingsScreensComponents = await retrieveComponentsByTypeAndDescription(query, 'settings screen');
    const productOverviewsComponents = await retrieveComponentsByTypeAndDescription(query, 'product overview');
    const productListsComponents = await retrieveComponentsByTypeAndDescription(query, 'product list');
    const categoryPreviewsComponents = await retrieveComponentsByTypeAndDescription(query, 'category preview');
    const shoppingCartsComponents = await retrieveComponentsByTypeAndDescription(query, 'shopping cart');
    const categoryFiltersComponents = await retrieveComponentsByTypeAndDescription(query, 'category filter');
    const productQuickviewsComponents = await retrieveComponentsByTypeAndDescription(query, 'product quickview');
    const productFeaturesComponents = await retrieveComponentsByTypeAndDescription(query, 'product feature');
    const storeNavigationComponents = await retrieveComponentsByTypeAndDescription(query, 'store navigation');
    const promoSectionsComponents = await retrieveComponentsByTypeAndDescription(query, 'promo section');
    const reviewsComponents = await retrieveComponentsByTypeAndDescription(query, 'review');
    const orderSummariesComponents = await retrieveComponentsByTypeAndDescription(query, 'order summary');
    const orderHistoryComponents = await retrieveComponentsByTypeAndDescription(query, 'order history');
    const incentivesComponents = await retrieveComponentsByTypeAndDescription(query, 'incentive');
    const storefrontPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'storefront page');
    const productPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'product page');
    const categoryPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'category page');
    const shoppingCartPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'shopping cart page');
    const checkoutPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'checkout page');
    const orderDetailPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'order detail page');
    const orderHistoryPagesComponents = await retrieveComponentsByTypeAndDescription(query, 'order history page');

    // Keep specific descriptions for variants
    const responsiveHeroSections = await retrieveComponentsByTypeAndDescription(query, 'Hero Sections', 'responsive variant');
    const darkModeHeroSections = await retrieveComponentsByTypeAndDescription(query, 'Hero Sections', 'dark mode variant');
    const responsiveCards = await retrieveComponentsByTypeAndDescription(query, 'Cards', 'responsive variant');
    const darkModeCards = await retrieveComponentsByTypeAndDescription(query, 'Cards', 'dark mode variant');
    
    return {
      general: generalComponents || [],
      hero: heroComponents || [],
      navbar: navbarComponents || [],
      features: featuresComponents || [],
      footer: footerComponents || [],
      testimonials: testimonialsComponents || [],
      pricing: pricingComponents || [],
      cta: ctaComponents || [],
      stats: statsComponents || [],
      team: teamComponents || [],
      contact: contactComponents || [],
      faq: faqComponents || [],
      gallery: galleryComponents || [],
      blog: blogComponents || [],
      newsletter: newsletterComponents || [],
      bentoGrid: bentoGridsComponents || [],
      headerSection: headerSectionsComponents || [],
      contactSection: contactSectionsComponents || [],
      teamSection: teamSectionsComponents || [],
      contentSection: contentSectionsComponents || [],
      logoCloud: logoCloudsComponents || [],
      faqs: faqsComponents || [],
      headers: headersComponents || [],
      flyoutMenu: flyoutMenusComponents || [],
      banner: bannersComponents || [],
      notFoundPage: notFoundPagesComponents || [],
      landingPage: landingPagesComponents || [],
      pricingPage: pricingPagesComponents || [],
      aboutPage: aboutPagesComponents || [],
      stackedLayout: stackedLayoutsComponents || [],
      sidebarLayout: sidebarLayoutsComponents || [],
      multiColumnLayout: multiColumnLayoutsComponents || [],
      pageHeading: pageHeadingsComponents || [],
      cardHeading: cardHeadingsComponents || [],
      sectionHeading: sectionHeadingsComponents || [],
      descriptionList: descriptionListsComponents || [],
      calendar: calendarsComponents || [],
      stackedList: stackedListsComponents || [],
      table: tablesComponents || [],
      gridList: gridListsComponents || [],
      feed: feedsComponents || [],
      formLayout: formLayoutsComponents || [],
      inputGroup: inputGroupsComponents || [],
      selectMenu: selectMenusComponents || [],
      signInRegistration: signInRegistrationComponents || [],
      textarea: textareasComponents || [],
      radioGroup: radioGroupsComponents || [],
      checkbox: checkboxesComponents || [],
      toggle: togglesComponents || [],
      actionPanel: actionPanelsComponents || [],
      combobox: comboboxesComponents || [],
      alert: alertsComponents || [],
      emptyState: emptyStatesComponents || [],
      navbars: navbarsComponents || [],
      pagination: paginationComponents || [],
      tabs: tabsComponents || [],
      verticalNavigation: verticalNavigationComponents || [],
      sidebarNavigation: sidebarNavigationComponents || [],
      breadcrumb: breadcrumbsComponents || [],
      progressBar: progressBarsComponents || [],
      commandPalette: commandPalettesComponents || [],
      modalDialog: modalDialogsComponents || [],
      drawer: drawersComponents || [],
      notification: notificationsComponents || [],
      avatar: avatarsComponents || [],
      badge: badgesComponents || [],
      dropdown: dropdownsComponents || [],
      button: buttonsComponents || [],
      buttonGroup: buttonGroupsComponents || [],
      container: containersComponents || [],
      card: cardsComponents || [],
      listContainer: listContainersComponents || [],
      mediaObject: mediaObjectsComponents || [],
      divider: dividersComponents || [],
      homeScreen: homeScreensComponents || [],
      detailScreen: detailScreensComponents || [],
      settingsScreen: settingsScreensComponents || [],
      productOverview: productOverviewsComponents || [],
      productList: productListsComponents || [],
      categoryPreview: categoryPreviewsComponents || [],
      shoppingCart: shoppingCartsComponents || [],
      categoryFilter: categoryFiltersComponents || [],
      productQuickview: productQuickviewsComponents || [],
      productFeature: productFeaturesComponents || [],
      storeNavigation: storeNavigationComponents || [],
      promoSection: promoSectionsComponents || [],
      review: reviewsComponents || [],
      orderSummary: orderSummariesComponents || [],
      orderHistory: orderHistoryComponents || [],
      incentive: incentivesComponents || [],
      storefrontPage: storefrontPagesComponents || [],
      productPage: productPagesComponents || [],
      categoryPage: categoryPagesComponents || [],
      shoppingCartPage: shoppingCartPagesComponents || [],
      checkoutPage: checkoutPagesComponents || [],
      orderDetailPage: orderDetailPagesComponents || [],
      orderHistoryPage: orderHistoryPagesComponents || [],
      // Add responsive and dark mode variants
      responsiveHeroSections: responsiveHeroSections || [],
      darkModeHeroSections: darkModeHeroSections || [],
      responsiveCards: responsiveCards || [],
      darkModeCards: darkModeCards || [],
    };
  } catch (error) {
    console.error('Error getting website components:', error);
    // Return empty structure instead of throwing
    return {
      general: [],
      hero: [],
      navbar: [],
      features: [],
      footer: [],
      testimonials: [],
      pricing: [],
      cta: [],
      stats: [],
      team: [],
      contact: [],
      faq: [],
      gallery: [],
      blog: [],
      newsletter: [],
      bentoGrid: [],
      headerSection: [],
      contactSection: [],
      teamSection: [],
      contentSection: [],
      logoCloud: [],
      faqs: [],
      headers: [],
      flyoutMenu: [],
      banner: [],
      notFoundPage: [],
      landingPage: [],
      pricingPage: [],
      aboutPage: [],
      stackedLayout: [],
      sidebarLayout: [],
      multiColumnLayout: [],
      pageHeading: [],
      cardHeading: [],
      sectionHeading: [],
      descriptionList: [],
      calendar: [],
      stackedList: [],
      table: [],
      gridList: [],
      feed: [],
      formLayout: [],
      inputGroup: [],
      selectMenu: [],
      signInRegistration: [],
      textarea: [],
      radioGroup: [],
      checkbox: [],
      toggle: [],
      actionPanel: [],
      combobox: [],
      alert: [],
      emptyState: [],
      navbars: [],
      pagination: [],
      tabs: [],
      verticalNavigation: [],
      sidebarNavigation: [],
      breadcrumb: [],
      progressBar: [],
      commandPalette: [],
      modalDialog: [],
      drawer: [],
      notification: [],
      avatar: [],
      badge: [],
      dropdown: [],
      button: [],
      buttonGroup: [],
      container: [],
      card: [],
      listContainer: [],
      mediaObject: [],
      divider: [],
      homeScreen: [],
      detailScreen: [],
      settingsScreen: [],
      productOverview: [],
      productList: [],
      categoryPreview: [],
      shoppingCart: [],
      categoryFilter: [],
      productQuickview: [],
      productFeature: [],
      storeNavigation: [],
      promoSection: [],
      review: [],
      orderSummary: [],
      orderHistory: [],
      incentive: [],
      storefrontPage: [],
      productPage: [],
      categoryPage: [],
      shoppingCartPage: [],
      checkoutPage: [],
      orderDetailPage: [],
      orderHistoryPage: [],
      responsiveHeroSections: [],
      darkModeHeroSections: [],
      responsiveCards: [],
      darkModeCards: [],
    };
  }
}
