function HowItWorksPage() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-2 space-y-10 text-gray-700">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">How It Works</h1>
        <p className="text-sm text-gray-500 mt-1">
          A simple way to report and recover lost items on campus.
        </p>
      </div>

      {/* What is this app */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-2">What is this?</h2>
        <p className="text-sm leading-relaxed">
          This app helps Full Sail students report lost or found items on campus.
          When someone finds an item, they hand it in to the school and post it here.
          The owner sees the post, checks where it is, and goes to pick it up in person.
          No messaging, no shipping — everything happens on campus.
        </p>
      </div>

      {/* Steps */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Steps</h2>
        <ol className="space-y-4 text-sm">
          {[
            ['Browse first', 'Check the Lost and Found pages before reporting — someone may have already posted your item.'],
            ['Report a lost item', 'Click "Report Item", select Lost, and describe your item. The more detail you add, the easier it is to match.'],
            ['Report a found item', 'Hand the item in to the front desk or security office, then post it here so the owner can find it.'],
            ['Pick it up', 'When you find your item on the app, check the location listed on the post and go there to claim it.'],
            ['Stay notified', 'Enable notifications to be alerted when new items are posted — no need to keep checking manually.'],
          ].map(([title, desc], i) => (
            <li key={i} className="flex gap-3">
              <span className="text-orange-500 font-bold flex-shrink-0">{i + 1}.</span>
              <span>
                <span className="font-medium text-gray-900">{title} — </span>
                {desc}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Campus Map */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-1">Campus Map</h2>
        <p className="text-sm text-gray-500 mb-3">
          Use this to find a posted location or describe where you found something.
        </p>
        <img
          src="/assets/CampusMap.jpg"
          alt="Full Sail University Campus Map"
          className="w-full rounded-lg border border-gray-200"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <p
          className="hidden text-sm text-gray-400 py-10 text-center border border-dashed border-gray-200 rounded-lg"
        >
          Map image not found.
        </p>
      </div>

      {/* Reporting tips */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Reporting Tips</h2>

        <p className="text-sm font-medium text-gray-800 mb-2">If you lost something:</p>
        <ul className="text-sm space-y-2 mb-5 list-disc list-inside text-gray-600">
          <li>Use a general item name like "Phone" or "Wallet" — not the brand</li>
          <li>Add your best guess for the location, even if you're not sure</li>
          <li>Fill in the private description with as much detail as possible — brand, color, markings. This is how we confirm you're the real owner</li>
          <li>Add a photo if you have one</li>
        </ul>

        <p className="text-sm font-medium text-gray-800 mb-2">If you found something:</p>
        <ul className="text-sm space-y-2 list-disc list-inside text-gray-600">
          <li>Keep the public name general — don't reveal details only the owner would know</li>
          <li>Be specific about where the item is now so the owner knows exactly where to go</li>
          <li>Your photo is stored privately and never shown publicly</li>
        </ul>
      </div>

      {/* Privacy note */}
      <p className="text-xs text-gray-400 border-t pt-4">
        Private descriptions and found item photos are never shown publicly —
        they're only used to confirm who the real owner is.
      </p>

    </div>
  );
}

export default HowItWorksPage;