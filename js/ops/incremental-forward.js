define(['js/ops/ops'], function(ops) {
	var IncrementalRuleHelper = function() {
		this.ruleset = ops.operators;
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
