export interface WalkthroughStep {
  title: string;
  description: string;
  icon: string;
}

export const USER_GUIDE_STEPS: WalkthroughStep[] = [
  {
    title: 'Welcome to Global Gadgets',
    description: `
      This application demonstrates the power of modern database and AI technologies using a fictious retail example.<br><br>
      <strong>In this guide, you will learn how to:</strong><br>
      1. Find products using different search methods.<br>
      2. Compare search algorithms.<br>
      3. Visualize products in your space, using Nano Banana.<br>
      4. Analyze Business Data using Looker directly on top of your transactional data in AlloyDB, as well as on your analytical tables in BigQuery in one view!<br>
    `,
    icon: 'storefront'
  },
  {
    title: 'Step 1: Finding the Perfect Gadget',
    description: `
      Navigate to the <strong>Product Search</strong> tab.<br><br>
      You can choose between different search methods:<br>
      <ul>
        <li>Traditional SQL</li>
        <li>Full-text Search</li>
        <li>Vector Search</li>
        <li>Hybrid Search</li>
      </ul>
      Use the text box to enter your query for the selected search method and click on 'Find' to execute the query and see the results.<br><br>
      There are example queries right below the text box to help you get started.<br>
      <br>
      <em>"headphones good for travel with long battery life"</em> or <em>"sleek white mechanical keyboard"</em>.<br><br>
    `,
    icon: 'search'
  },
  {
    title: 'Step 2: Check the SQL and Architecture',
    description: `
      Every successful query returns reveals a View SQL Queries button right above the results. Click it to see the SQL queries that were executed to generate the results and the facets shown in the app.<br><br>
      If you want to dive in deeper, click the <strong>Architecture</strong> button (flow chart icon) in the toolbar.<br><br>
      This will bring up a screen to compare the different search methods, lists their pros and cons, and shows an example query.<br><br>
    `,
    icon: 'compare_arrows'
  },
  {
    title: 'Step 3: Visualize in Your Space',
    description: `
      If you click on <strong>Visualize</strong> on one of the product cards, you can see how the product might fit into your home using the generative power of Nano Banana.<br><br>
      Try it, and see if that console works on your desk!<br><br>
    `,
    icon: 'image'
  },
  {
    title: 'Step 4: Talk to Your Data',
    description: `
      Visit the <strong>AlloyDB AI</strong> or <strong>BigQuery AI</strong> tabs.<br><br>
      Click the tiles to run real-time AI queries like <em>"Summarize negative reviews"</em> or <em>"Predict demand for Q4"</em> directly in the database.
    `,
    icon: 'psychology'
  },
  {
    title: 'Step 5: Operational Intelligence',
    description: `
      Check the <strong>Operational and Analytical Insights</strong> tab to view real-time business metrics powered by Looker.<br><br>
      The dashboard has two tabs, one for operational metrics and one for analytical metrics, based on different data source.<br><br>
      See the power of business intelligence on your data where it is generated and where it is powered by the latest features in our databases, such as the <a href='https://docs.cloud.google.com/alloydb/docs/columnar-engine/about'>columnar engine in AlloyDB</a> and <a href='https://cloud.google.com/blog/products/data-analytics/short-query-optimizations-in-bigquery-advanced-runtime?e=48754805'>short query optimizations in the advanced runtime</a>.<br><br> 
    `,
    icon: 'insights'
  }
];
