/**
 * CRM Communication Timeline — Async Loader Snippet
 *
 * Place this in the host page <head> or before any SDK calls.
 * The SDK script can load async/defer without missing early calls.
 *
 * Usage:
 *   1. Include this snippet (inline or as a separate <script>)
 *   2. Call CRMCommTimeline.mount(...) whenever ready — even before the SDK loads
 *   3. Load the full SDK with: <script async src="https://cdn.example.com/sdk/v1/comm-timeline.umd.cjs"></script>
 */
(function (w) {
  // If the SDK is already loaded, do nothing
  if (w.CRMCommTimeline && typeof w.CRMCommTimeline.mount === 'function') return;

  // Create a stub with a command queue
  var queue = (w.CRMCommTimeline && w.CRMCommTimeline.q) || [];
  w.CRMCommTimeline = {
    q: queue,
    mount: function () { queue.push(['mount'].concat(Array.prototype.slice.call(arguments))); },
    unmount: function () { queue.push(['unmount']); },
    setEntity: function () { queue.push(['setEntity'].concat(Array.prototype.slice.call(arguments))); },
    refresh: function () { queue.push(['refresh']); },
    openEvent: function () { queue.push(['openEvent'].concat(Array.prototype.slice.call(arguments))); },
    setFilter: function () { queue.push(['setFilter'].concat(Array.prototype.slice.call(arguments))); },
    destroy: function () { queue.push(['destroy']); },
  };
})(window);
