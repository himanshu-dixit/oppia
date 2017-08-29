// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Directive for a text interaction question in the simple editor.
 */

// NOTE TO DEVELOPERS: This is meant to be a reusable directive, so its only
// dependencies should be standard utility services. It should not have any
// concept of "state in an exploration".

// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Directive for a multiple choice question in the simple editor.
 */

// NOTE TO DEVELOPERS: This is meant to be a reusable directive, so its only
// dependencies should be standard utility services. It should not have any
// concept of "state in an exploration".
oppia.directive('textInteraction', [
    'QuestionIdService', 'AnswerGroupObjectFactory', 'RuleObjectFactory',
    'StatusObjectFactory', 'OutcomeObjectFactory', 'UrlInterpolationService',
    function(QuestionIdService, AnswerGroupObjectFactory, RuleObjectFactory,
             StatusObjectFactory, OutcomeObjectFactory, UrlInterpolationService) {
        return {
            restrict: 'E',
            scope: {
                // A unique ID that allows events to be broadcast specifically to this
                // directive.
                getUniqueId: '&uniqueId',
                getCustomizationArgs: '&customizationArgs',
                getAnswerGroups: '&answerGroups',
                getRawDefaultOutcome: '&defaultOutcome',
                saveCustomizationArgs: '&',
                saveAnswerGroups: '&',
                saveDefaultOutcome: '&',
                addState: '&'
            },
            templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
                '/pages/exploration_editor/simple_editor_tab/questions/' +
                'text_interaction_directive.html'),
            controller: [
                '$scope', '$timeout', 'alertsService',
                function($scope, $timeout, alertsService) {
                    // Note that a questionId generated in this way may contain spaces,
                    // since it is just the state name.
                    $scope.questionId = $scope.getUniqueId();

                    $scope.getSubfieldId = function(label) {
                        return QuestionIdService.getSubfieldId($scope.questionId, label);
                    };

                    $scope.getFieldId = function(index) {
                        return $scope.questionId + '.' + index;
                    };

                    $scope.getPlaceholder() = function() {
                      return 'df';
                    };

                    $scope.updatePlaceholder() = function(placeholderText) {
                      return 'df';
                    };

                    $scope.updateAnswer = function(newText) {
                        if (!newText) {
                            alertsService.addWarning('Cannot save an empty answer.');
                            return StatusObjectFactory.createFailure(
                                'Cannot save an empty answer'
                            );
                        }
                    };

                    $scope.updateType = function(index) {
                        var newCustomizationArgs = $scope.getCustomizationArgs();
                        if (newCustomizationArgs.choices.value.length === 1) {
                            throw Error(
                                'Cannot update text interaction type.');
                        }

                    };

                }
            ]
        };
    }
]);
