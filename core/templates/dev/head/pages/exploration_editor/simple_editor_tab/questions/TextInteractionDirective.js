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
                    var answerGroups = $scope.getAnswerGroups();

                    $scope.getSubfieldId = function(label) {
                      return QuestionIdService.getSubfieldId($scope.questionId, label);
                    };

                    $scope.getFieldId = function(index) {
                      return $scope.questionId + '.' + index;
                    };

                    $scope.getAnswer = function() {
                      if (answerGroups.length !== 0) {
                        return answerGroups[0].rules[0].inputs.x;
                      }
                    };

                    $scope.saveAnswer = function(newAnswer) {
                      var newAnswerGroups = answerGroups;
                      newAnswerGroups[0].rules[0].inputs.x = newAnswer;
                      $scope.saveAnswerGroups({
                        newValue: newAnswerGroups
                      });
                    };

                    $scope.saveCorrectAnswerFeedback = function(newFeedback) {
                      var newAnswerGroup = answerGroups;
                      if (newAnswerGroup.length === 0) {
                        throw Error('Empty answer groups detected');
                      }
                      newAnswerGroups[0].outcome.feedback[0] = newFeedback;
                      $scope.saveAnswerGroups({
                        newValue: newAnswerGroups
                      });
                    };

                    $scope.getDefaultOutcome = function() {
                      var defaultOutcome = $scope.getRawDefaultOutcome();
                      if (defaultOutcome.feedback.length === 0) {
                        defaultOutcome.feedback.push('');
                      }
                      return defaultOutcome;
                    };

                    $scope.saveDefaultFeedback = function(newFeedback) {
                      var newDefaultOutcome = $scope.getDefaultOutcome();
                      newDefaultOutcome.feedback[0] = newFeedback;
                      $scope.saveDefaultOutcome({
                        newValue: newDefaultOutcome
                      });
                    };

                }
            ]
        };
    }
]);