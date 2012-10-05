var define = function(requiredmodules, continuation) {
	return continuation.apply(global, requiredmodules.map(function(filename) {
		return require(filename);
	}));
};

global.define = define;
exports.define = define;
