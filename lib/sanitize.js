
function escapeHTML(value) {
  return !value ? '' : String(value).replace(/[&<>"']/g, function(match) {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
    }
  })
}

module.exports = {
  escapeHTML: escapeHTML
}
