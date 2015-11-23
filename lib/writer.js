function Writer() {
  this.output = "";
}

Writer.prototype.write = function(chunk, var_chunks) {
  var i, l = arguments.length;
  switch (l) {
    case 1:
      this.output += chunk;
      return;
    default:
      for (i = 0; i < l;)
        this.output += arguments[i++];
  }
}

Writer.prototype.getWriter = function() {
  return this.write.bind(this);
}

module.exports = {
  Writer:  Writer
}
