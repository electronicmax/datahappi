define(['js/ops/forward-ops'], function(ops) {
	var IncrementalRuleHelper = function(options) {
		this.ruleset = options.ruleset || ops.operators;
		console.log("setting ruleset ", this.ruleset);
		
	};
	IncrementalRuleHelper.prototype = {
		set_ruleset:function(ruleset) {
			this.ruleset = ruleset;
		},
		get_triggers:function(props) {
			// gets all rules that pertain
			return this.ruleset.filter(function(r) {
				return _(r.domain).isUndefined() ||
					r.domain.length === 0 ||
					_(r.domain).difference(props).length === 0;
			});
		}
	};
	return { RuleHelper : IncrementalRuleHelper };
});
