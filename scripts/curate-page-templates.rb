require 'json'

PAGES = {
  'about' => ['Our story', 'Designed with purpose', 'We create considered pieces for everyday life, balancing character, usefulness, and longevity.', 'People before product|Independent ideas become better products when they begin with real lives and real needs.|Thoughtful by default|Every material, proportion, and detail should earn its place.|Built for the long term|We favour enduring relevance over a constant cycle of replacement.'],
  'advanced-product' => ['Product detail', 'Everything in one place', 'Explore the product from every angle, compare its details, and choose the right configuration.', 'Choose your version|Review sizes, colours, and available product options.|Understand the details|Use specifications, materials, and care notes to assess the product.|Complete the experience|Add compatible products, bundles, or a recurring plan where available.'],
  'back-in-stock' => ['Availability', 'Be first to know', 'Register your interest and we will let you know when the product becomes available again.', 'Choose the exact item|Select the relevant product and variant so the alert is useful.|Leave your email|We only use it for the availability update you requested.|Move quickly|Restocked pieces can be limited, so follow the link when your notification arrives.'],
  'before-after' => ['The difference', 'See what thoughtful changes can do', 'Compare the starting point with the finished result and understand the choices behind it.', 'Start with context|See the original challenge before reviewing the outcome.|Notice the details|Small improvements in fit, material, or routine create the larger change.|Apply it yourself|Use the supporting guidance to find the most relevant products.'],
  'bundle-builder' => ['Build your set', 'A bundle shaped around you', 'Choose complementary products, create a useful set, and keep the experience straightforward.', 'Start with the essential|Pick the product that anchors the bundle.|Add what works with it|Choose complementary pieces based on use, fit, or routine.|Review your set|Check variants and quantities before adding everything to the basket.'],
  'bundles' => ['Curated sets', 'Better together', 'Shop ready-made combinations designed to work together and offer a simpler way to choose.', 'Purposeful combinations|Each set brings together products with a clear shared use.|One considered decision|Spend less time matching individual items.|Easy gifting|A complete set makes a useful, confident gift.'],
  'comparison' => ['Compare', 'Make the differences clear', 'Place products side by side and focus on the specifications that change your decision.', 'Select up to four|Choose the products you are genuinely considering.|Compare like for like|Review price, availability, type, and configured metafields.|Choose for your needs|The best product is the one that fits how you will use it.'],
  'contact' => ['Contact', 'Start the conversation', 'Send the right details and our team can route your question quickly.', 'Order support|Include your order number and the email used at checkout.|Product advice|Tell us which product, size, or option you are considering.|Partnerships|Share the business, press, or wholesale context for your enquiry.'],
  'faq-hub' => ['Help centre', 'Answers, organised', 'Find practical information by topic before contacting customer care.', 'Orders and delivery|Track dispatches, understand timings, and resolve delivery questions.|Products and care|Find sizing, materials, use, and maintenance guidance.|Returns and accounts|Review return steps and manage customer details.'],
  'faq' => ['Frequently asked', 'Quick answers to common questions', 'Browse clear guidance about shopping, delivery, products, and customer care.', 'Before ordering|Find sizing, stock, payment, and product information.|After ordering|Review delivery, changes, returns, and refund guidance.|Still need help?|Contact the team with the relevant details.'],
  'gift-guide' => ['Gift guide', 'A thoughtful answer for every recipient', 'Browse useful ideas by person, occasion, and budget without overcomplicating the choice.', 'For the difficult to buy for|Start with versatile products that suit different routines.|For meaningful moments|Choose pieces with a lasting use beyond the occasion.|When time is short|Use ready-made sets or flexible gift options.'],
  'ingredients' => ['Materials', 'Know what goes into every product', 'Understand the materials, ingredients, purpose, and sourcing behind the collection.', 'What it is|Clear names and plain-language descriptions of each material.|Why it is used|The function, feel, or performance it contributes.|How to care for it|Practical steps that protect quality and extend useful life.'],
  'lookbook' => ['Lookbook', 'Ideas for wearing the collection', 'Explore seasonal combinations, proportions, and styling details, then make them your own.', 'Begin with one anchor|Build each look around a versatile central piece.|Work with proportion|Balance volume, length, and texture rather than matching everything.|Repeat differently|Restyle existing pieces with a new layer or combination.'],
  'loyalty' => ['Membership', 'Value that grows with every visit', 'Earn useful benefits, see your progress, and access member experiences.', 'Join once|Create an account to begin collecting eligible rewards.|Earn naturally|Qualifying purchases and activities add to your balance.|Use benefits clearly|See available rewards and redemption details in your account.'],
  'mega-menu' => ['Navigation', 'A clearer way through the collection', 'Use rich navigation to surface departments, collections, featured products, and timely stories.', 'Organise by intent|Group links around how customers actually browse.|Add visual direction|Use collection or product imagery to speed recognition.|Feature what matters now|Give campaigns and new edits a focused promotional space.'],
  'press' => ['Press', 'Somos in print and conversation', 'Explore selected coverage, interviews, and independent perspectives on the brand.', 'Latest coverage|Recent features and announcements appear first.|Brand resources|Approved information helps editors represent Somos accurately.|Press enquiries|Contact the team with publication and deadline details.'],
  'product-finder' => ['Product finder', 'A shorter path to the right choice', 'Answer a few practical questions and narrow the collection around your needs.', 'Tell us the use|Begin with what you need the product to do.|Add your preferences|Refine by fit, finish, routine, or priorities.|Review the match|Understand why each recommendation suits your answers.'],
  'quiz' => ['Guided finder', 'Find your match', 'A short sequence of questions turns preferences into a focused recommendation.', 'Keep it honest|Choose the answer closest to your actual routine.|Compare the result|Review why the suggested option fits.|Adjust when needed|Return to an earlier answer to explore another route.'],
  'recently-viewed' => ['Your browsing', 'Continue where you left off', 'Return to products you recently explored and compare them while the details are familiar.', 'Pick up quickly|Reopen products without searching for them again.|Compare your shortlist|Review price, colour, and availability side by side.|Clear your trail|Recently viewed data can be reset when you want a fresh start.'],
  'recipes-guides' => ['Guides', 'Useful ideas beyond the product page', 'Explore practical tutorials, routines, and editorial advice designed for real use.', 'Step-by-step help|Follow focused instructions without unnecessary complexity.|Product context|Understand where a product fits and what works alongside it.|Ideas to revisit|Save useful guides and return as your needs change.'],
  'refer-a-friend' => ['Refer a friend', 'Share something worth discovering', 'Invite someone to Somos and follow the reward terms clearly.', 'Send your link|Use your personal referral route where available.|A friend discovers Somos|They can explore and complete an eligible first order.|Receive the benefit|Qualifying rewards appear according to the programme terms.'],
  'reviews-ugc' => ['Community', 'Worn, used, and shared by you', 'See honest customer experiences and product stories from the Somos community.', 'Real product context|Learn how pieces fit into different lives and routines.|Useful detail|Look for comments about fit, quality, and long-term use.|Share responsibly|Only submit content you own and are happy for the brand to feature.'],
  'rewards' => ['Rewards', 'Make every interaction count', 'Understand how to earn, track, and redeem available customer rewards.', 'Earn points|Eligible purchases and activities contribute to your balance.|See your progress|Sign in to review points, status, and available benefits.|Redeem clearly|Apply eligible rewards according to their terms.'],
  'sales' => ['Sale edit', 'Considered pieces, better value', 'Browse reduced products without losing sight of fit, usefulness, or longevity.', 'Check availability|Sale sizes and colours can move quickly.|Review final-sale terms|Read the product and returns information before ordering.|Choose for the long term|A lower price is most valuable when the piece will be used.'],
  'shop-the-look' => ['Shop the look', 'From image to individual pieces', 'Use interactive hotspots to identify and shop every product in the story.', 'Open a hotspot|Select a marker to reveal the featured product.|Explore the piece|Review its price and full product information.|Build your version|Choose the parts of the look that work for you.'],
  'size-guide' => ['Fit guide', 'Measure once, choose with confidence', 'Use body and garment measurements alongside the intended fit of each product.', 'Measure accurately|Use a soft tape and keep it level without pulling tightly.|Compare the product|Check the product-specific chart rather than assuming every fit is identical.|Choose your preference|Size up or down when you prefer more ease or a closer fit.'],
  'specifications' => ['Specifications', 'The technical details, made readable', 'Review dimensions, materials, compatibility, performance, and care in one place.', 'Dimensions and fit|Check measurements against your space, body, or intended use.|Materials and construction|Understand what the product is made from and how it is assembled.|Compatibility and care|Confirm requirements and maintenance before purchase.'],
  'stockists' => ['Stockists', 'Find Somos in person', 'Discover selected retailers carrying the collection and confirm availability before travelling.', 'Search your area|Use location information to find the nearest partner.|Check the range|Individual stockists may carry different products and sizes.|Contact ahead|Confirm opening times and live availability with the retailer.'],
  'store-locator' => ['Store locator', 'Plan your visit', 'Search by place, review store details, and find the most convenient location.', 'Enter a location|Use a town, city, or postcode to begin.|Compare locations|Review distance, services, and opening information.|Confirm before travel|Contact the store for live stock or holiday hours.'],
  'subscription-landing' => ['Subscribe & save', 'A simpler way to stay stocked', 'Choose an eligible product and recurring delivery plan through Shopify selling plans.', 'Choose the product|Select the exact variant you want to receive.|Set the frequency|Available delivery plans come directly from the product setup.|Stay in control|Manage eligible subscription details through your customer account.'],
  'support' => ['Customer care', 'Practical help from real people', 'Start with common guidance or send the details our team needs to resolve your issue.', 'Orders|Get help with changes, tracking, delivery, and returns.|Products|Ask about sizing, materials, care, or compatibility.|Accounts|Resolve sign-in, rewards, subscription, or profile questions.'],
  'sustainability' => ['Responsibility', 'Progress over vague promises', 'See how materials, production choices, packaging, and product longevity shape our approach.', 'Design for longer use|Durability and repeat wear reduce the need for constant replacement.|Choose with evidence|We prioritise traceable information over unsupported claims.|Improve continuously|Targets and practices should develop as better options become available.'],
  'wholesale' => ['Wholesale', 'Bring Somos to your customers', 'Learn how we work with aligned retailers and send a complete trade enquiry.', 'Tell us about your store|Share location, audience, channels, and existing brand mix.|Discuss the range|We will review suitable products, quantities, and seasonal timing.|Plan the partnership|Approved accounts receive commercial and ordering details.'],
  'wishlist' => ['Wishlist', 'Keep the pieces worth returning to', 'Save products, compare your shortlist, and revisit availability when you are ready.', 'Save as you browse|Use the wishlist control on eligible product cards and pages.|Review together|Compare fit, price, colour, and purpose in one shortlist.|Move when ready|Open the product to confirm live variants before adding it to the cart.']
}.freeze

DEFAULT_PAGE = ['Information', 'Everything you need, clearly organised', 'Use this flexible page for useful brand, service, or product information.', 'Start with the essentials|Lead with the information visitors need to understand the page.|Add useful context|Use supporting details, images, and links to answer the next question.|Offer a clear next step|Finish with one relevant route rather than several competing actions.'].freeze

CTA = {
  'contact'=>'Send an enquiry|Include the relevant details and our team will route your message.|Contact us|/pages/contact',
  'support'=>'Still need help?|Send us the details and our customer-care team will assist.|Contact support|/pages/contact',
  'wholesale'=>'Interested in stocking Somos?|Tell us about your store, customers, and plans.|Start a wholesale enquiry|/pages/contact',
  'stockists'=>'Looking for a specific product?|Contact the retailer before travelling to confirm live availability.|Find a store|/pages/store-locator',
  'store-locator'=>'Ready to visit?|Check the store details and contact the location for live stock.|View locations|/pages/stockists',
  'size-guide'=>'Need personal fit advice?|Tell us the product and measurements you are considering.|Ask about fit|/pages/contact',
  'comparison'=>'Ready to choose?|Open the product that best matches your priorities.|Shop the collection|/collections/all',
  'sustainability'=>'Explore the products behind the approach|Choose considered pieces and care for them well.|Shop the collection|/collections/all',
  'press'=>'Working on a story?|Send the publication, subject, and deadline with your request.|Contact the press team|/pages/contact',
  'gift-guide'=>'Found the right direction?|Explore the collection and choose a gift made for lasting use.|Shop gifts|/collections/all'
}.freeze

FUNCTIONAL_MAINS = {
  'back-in-stock'=>['back-in-stock', {'title'=>'Get notified when it returns', 'description'=>'Choose the sold-out product and leave your email so you can act when it becomes available again.', 'product_name'=>'Selected product'}],
  'wishlist'=>['wishlist-page', {'title'=>'Your saved pieces', 'description'=>'Review the products you saved, compare the details, and return to the product page for live availability.'}],
  'recently-viewed'=>['recently-viewed-products', {'title'=>'Continue where you left off', 'description'=>'Return to products you recently explored and keep your shortlist moving.'}],
  'refer-a-friend'=>['referral-rewards', {'title'=>'Bring a friend along', 'description'=>'Share your referral route and follow eligible rewards clearly from invitation to redemption.', 'referral_link'=>'/account/register'}],
  'subscription-landing'=>['subscription-landing', {'title'=>'Subscribe and save', 'description'=>'Select an eligible product and choose from the Shopify selling plans attached to it.', 'product'=>''}],
  'product-finder'=>['quiz-flow', {'title'=>'Find the right product for you', 'description'=>'Answer a few practical questions and receive a more focused recommendation.'}]
}.freeze

def clean_json(path)
  raw = File.read(path)
  [raw[/\A\s*\/\*.*?\*\/\s*/m] || '', JSON.parse(raw.sub(/\A\s*\/\*.*?\*\/\s*/m, ''))]
end

Dir['templates/page*.json'].sort.each_with_index do |path, index|
  slug = File.basename(path, '.json').sub(/^page\.?/, '')
  content = slug.empty? ? DEFAULT_PAGE : PAGES[slug]
  next unless content
  eyebrow, heading, intro, raw_items = content
  comment, data = clean_json(path)
  if (functional = FUNCTIONAL_MAINS[slug])
    data['sections']['main'] = {'type'=>functional[0], 'settings'=>functional[1]}
    if functional[0] == 'quiz-flow'
      data['sections']['main']['blocks'] = {}
      data['sections']['main']['block_order'] = []
    end
  end
  items = raw_items.split('|').each_slice(2).to_a
  blocks = {}
  items.each_with_index do |(item_heading, text), i|
    id = "detail_#{i + 1}"
    blocks[id] = {'type'=>'item', 'settings'=>{'label'=>eyebrow, 'heading'=>item_heading, 'text'=>text, 'link_label'=>'', 'link_url'=>''}}
  end
  data['sections']['page_details'] = {
    'type'=>'editorial-content-grid', 'blocks'=>blocks, 'block_order'=>blocks.keys,
    'settings'=>{'layout'=>%w[numbered grid statement][index % 3], 'eyebrow'=>eyebrow, 'heading'=>heading, 'intro'=>"<p>#{intro}</p>", 'color_scheme'=>index.odd? ? 'scheme-2' : 'scheme-1'}
  }
  primary = data.dig('sections', 'editorial_primary', 'settings')
  secondary = data.dig('sections', 'editorial_secondary', 'settings')
  if primary
    primary['eyebrow'] = eyebrow
    primary['heading'] = items.first.first
    primary['body'] = "<p>#{items.first.last}</p>"
    primary['points'] = items.drop(1).map(&:first).join("\n")
    primary['image_position'] = index.even? ? 'left' : 'right'
  end
  if (faq = data['sections']['page_faq'])
    faq['settings'] ||= {}
    faq['settings']['heading'] = "Questions about #{eyebrow.downcase}"
    faq['settings']['intro'] = "Practical answers specific to this page."
    faq['blocks'] = {}
    faq['block_order'] = []
    items.each_with_index do |(item_heading, text), i|
      id = "question_#{i + 1}"
      faq['blocks'][id] = {'type'=>'faq', 'settings'=>{'question'=>"What should I know about #{item_heading.downcase}?", 'answer'=>text}}
      faq['block_order'] << id
    end
  end
  if (cta = data['sections']['page_cta'])
    values = (CTA[slug] || "Continue exploring|Discover products designed for everyday use.|Shop the collection|/collections/all").split('|')
    cta['settings'] = {'heading'=>values[0], 'text'=>values[1], 'link_label'=>values[2], 'link_url'=>values[3], 'color_scheme'=>'scheme-1'}
  end
  if (testimonials = data['sections']['page_testimonials'])
    unless %w[loyalty refer-a-friend reviews-ugc rewards sales bundles bundle-builder wishlist subscription-landing].include?(slug)
      data['order'].delete('page_testimonials')
      data['sections'].delete('page_testimonials')
    else
      testimonials['settings'] = {'heading'=> slug == 'reviews-ugc' ? 'From the Somos community' : 'Why customers return', 'color_scheme'=>'scheme-1'}
      quotes = [['The details feel considered, and the product has become part of my everyday rotation.','Verified customer'],['Clear information made it easier to choose confidently.','Somos customer'],['Thoughtful service from browsing through to delivery.','Returning customer']]
      testimonials['blocks'] = {}; testimonials['block_order'] = []
      quotes.each_with_index{|(quote,author),i| id="quote_#{i+1}"; testimonials['blocks'][id]={'type'=>'quote','settings'=>{'quote'=>quote,'author'=>author}}; testimonials['block_order']<<id}
    end
  end
  if secondary
    secondary['eyebrow'] = 'Next step'
    secondary['heading'] = items.last.first
    secondary['body'] = "<p>#{items.last.last}</p>"
    secondary['points'] = items.map(&:first).reverse.join("\n")
    secondary['image_position'] = index.even? ? 'right' : 'left'
  end
  order = data['order']
  order.delete('page_details')
  insert_at = [order.index('editorial_secondary') || order.length, order.length].min
  order.insert(insert_at, 'page_details')
  File.write(path, comment + JSON.pretty_generate(data) + "\n")
end

# Shopify requires every section object in a JSON template to appear in `order`.
# Remove stale sections left behind when page-specific layouts omit a shared section.
Dir['templates/*.json'].each do |path|
  comment, data = clean_json(path)
  next unless data['sections'].is_a?(Hash) && data['order'].is_a?(Array)
  ordered_ids = data['order']
  data['sections'].select! { |id, _section| ordered_ids.include?(id) }
  File.write(path, comment + JSON.pretty_generate(data) + "\n")
end

puts "Curated #{PAGES.length + 1} page templates"
