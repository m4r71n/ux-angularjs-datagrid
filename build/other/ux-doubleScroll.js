/*
* uxDatagrid v.0.2.0
* (c) 2014, WebUX
* License: MIT.
*/
(function(exports, global){
exports.datagrid.events.DOUBLE_SCROLL_SCROLL_TO_TOP = "datagrid:doubleScrollScrollToTop";

exports.datagrid.events.DOUBLE_SCROLL_SCROLL_TO_BOTTOM = "datagrid:doubleScrollScrollToBottom";

angular.module("ux").directive("uxDoubleScroll", function() {
    return {
        link: function(scope, element, attr) {
            var el = element[0], lastValue = 0, unwatchRender, result = {}, selector = scope.$eval(attr.uxDoubleScroll), target, vScroll, contentHeight = 0, elHeight = 0, targetOffset = scope.$eval(attr.targetOffset) || 0, scrollModel;
            element[0].style.overflow = "auto";
            updateTarget();
            updateScrollModel();
            function updateTarget() {
                if (!target) {
                    target = element[0].querySelector(selector);
                }
            }
            function updateScrollModel() {
                scrollModel = scope.datagrid && scope.datagrid.scrollModel || {};
            }
            function onScroll(event) {
                updateTarget();
                if (target) {
                    if (el.scrollTop + el.offsetHeight < el.scrollHeight) {
                        target.style.overflow = "hidden";
                    } else {
                        target.style.overflow = "auto";
                    }
                } else {
                    throw new Error(selector ? 'selector "' + selector + '" did not select any objects' : "double scroll requires a selector.");
                }
            }
            function scrollToTop() {
                var enabled;
                if (exports.datagrid.isIOS) {
                    enabled = vScroll.enable();
                    vScroll.enable(true);
                    vScroll.scrollTo(0, true);
                    vScroll.enable(enabled);
                } else {
                    el.scrollTop = 0;
                }
            }
            function scrollToBottom() {
                var enabled;
                if (exports.datagrid.isIOS) {
                    enabled = vScroll.enable();
                    vScroll.enable(true);
                    vScroll.scrollToBottom(true);
                    vScroll.enable(enabled);
                } else {
                    el.scrollTop = el.scrollHeight - el.offsetHeight;
                }
            }
            function onIOScroll(value) {
                if (vScroll.enable() && value !== lastValue) {
                    lastValue = value;
                    vScroll.content.css({
                        webkitTransform: "translate3d(0px, " + (element[0].scrollTop - value) + "px, 0px)"
                    });
                }
            }
            function onSizeChange() {
                var content = element.children();
                elHeight = element[0].offsetHeight;
                target.style.height = elHeight - targetOffset + "px";
                content.children()[1].style.height = elHeight + "px";
                contentHeight = content.children()[0].offsetHeight + elHeight;
                content[0].style.height = contentHeight + "px";
                scope.datagrid.upateViewportHeight();
            }
            function onTargetScrollToTop(event, scroller, speed) {
                if (scroller.element[0] === target) {
                    scrollModel.enable(false);
                    vScroll.enable(true, speed);
                    target.disabled = "disabled";
                }
            }
            function onDoubleScrollBottom(event, scroller, speed) {
                if (scroller.element[0] === element[0]) {
                    vScroll.enable(false);
                    scrollModel.enable(true, speed);
                    target.disabled = "";
                }
            }
            if (exports.datagrid.isIOS) {
                vScroll = ux.datagrid.VirtualScroll(scope, element, {}, onIOScroll);
                vScroll.setup();
                unwatchRender = scope.$on(exports.datagrid.events.LISTENERS_READY, function() {
                    unwatchRender();
                    updateScrollModel();
                    updateTarget();
                    onSizeChange();
                    onIOScroll(0);
                    unwatchRender = scope.$on(exports.datagrid.events.AFTER_RENDER, function() {
                        unwatchRender();
                        onTargetScrollToTop(null, scrollModel, .05);
                        onSizeChange();
                    });
                });
                scope.$on(exports.datagrid.events.VIRTUAL_SCROLL_TOP, onTargetScrollToTop);
                scope.$on(exports.datagrid.events.VIRTUAL_SCROLL_BOTTOM, onDoubleScrollBottom);
            } else {
                element[0].addEventListener("scroll", onScroll, true);
                if (target) {
                    onSizeChange();
                    onScroll(null);
                } else {
                    unwatchRender = scope.$on(exports.datagrid.events.LISTENERS_READY, function() {
                        unwatchRender();
                        updateTarget();
                        onSizeChange();
                        onScroll(null);
                    });
                }
            }
            result.resize = function resize(height) {
                if (height !== undefined) {
                    element[0].style.height = height + "px";
                }
                onSizeChange();
            };
            result.scrollToBottom = function() {
                if (vScroll) {
                    vScroll.scrollToBottom();
                } else {
                    element[0].scrollTop = element.children().children()[0].offsetHeight;
                }
            };
            scope.doubleScroll = result;
            scope.$on(exports.datagrid.events.RESIZE, onSizeChange);
            scope.$on(exports.datagrid.events.DOUBLE_SCROLL_SCROLL_TO_TOP, scrollToTop);
            scope.$on(exports.datagrid.events.DOUBLE_SCROLL_SCROLL_TO_BOTTOM, scrollToBottom);
            scope.$on("$destroy", function() {
                if (exports.datagrid.isIOS) {
                    vScroll.destroy();
                    vScroll = null;
                } else {
                    element[0].removeEventListener("scroll", onScroll);
                }
            });
        }
    };
});
}(this.ux = this.ux || {}, function() {return this;}()));