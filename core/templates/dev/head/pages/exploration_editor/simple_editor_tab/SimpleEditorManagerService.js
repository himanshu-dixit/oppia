// Copyright 2016 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Service that maintains the title, introduction and list of
 * questions shown in the simple editor. This service provides functionality
 * for updating the questions that are displayed in the UI, and passing the
 * updates through to services like explorationStatesService that are
 * responsible for generally maintaining the frontend exploration data.
 */

oppia.factory('SimpleEditorManagerService', [
  'AnswerGroupObjectFactory', 'OutcomeObjectFactory', 'QuestionObjectFactory',
  'QuestionListObjectFactory', 'RuleObjectFactory', 'StatesToQuestionsService',
  'SimpleEditorShimService', function(
      AnswerGroupObjectFactory, OutcomeObjectFactory, QuestionObjectFactory,
      QuestionListObjectFactory, RuleObjectFactory, StatesToQuestionsService,
      SimpleEditorShimService) {
    var data = {
      title: null,
      introductionHtml: null,
      questionList: null
    };

    var DEFAULT_INTERACTION_PROPERTIES = {
      MultipleChoiceInput: {
        CUSTOMIZATION_ARGS:  {
          choices: {
            value: ['<p>Option 1</p>']
          }
        },
        ANSWER_GROUP: {
          type: 'Equals',
          value: {
            x: 0
          }
        }
      }
    };

    var DEFAULT_INTERACTION = {
      ID: 'MultipleChoiceInput',
      CUSTOMIZATION_ARGS: {
        choices: {
          value: ['<p>Option 1</p>']
        }
      }
    };

    var END_EXPLORATION_INTERACTION = {
      ID: 'EndExploration',
      CUSTOMIZATION_ARGS: {
        recommendedExplorationIds: {
          value: []
        }
      }
    };

    var getNewStateName = function() {
      var allStateNames = data.questionList.getAllStateNames();

      var minimumStateNumber = data.questionList.getQuestionCount();
      while (allStateNames.indexOf('Question ' + minimumStateNumber) !== -1) {
        minimumStateNumber++;
      }
      return 'Question ' + minimumStateNumber;
    };

    return {
      // Attempts to initialize the local data variables. Returns true if
      // the initialization is successful (judged by the success of
      // initializing the question list), and false otherwise.
      tryToInit: function() {
        data.title = SimpleEditorShimService.getTitle();
        data.introductionHtml = SimpleEditorShimService.getIntroductionHtml();
        var questions = StatesToQuestionsService.getQuestions();
        if (!questions) {
          return false;
        }

        data.questionList = QuestionListObjectFactory.create(questions);
        return true;
      },
      getData: function() {
        return data;
      },
      getTitle: function() {
        return data.title;
      },
      getIntroductionHtml: function() {
        return data.introductionHtml;
      },
      getQuestionList: function() {
        return data.questionList;
      },
      saveTitle: function(newTitle) {
        SimpleEditorShimService.saveTitle(newTitle);
        data.title = newTitle;
      },
      saveIntroductionHtml: function(newIntroductionHtml) {
        SimpleEditorShimService.saveIntroductionHtml(newIntroductionHtml);
        data.introductionHtml = newIntroductionHtml;
      },
      saveCustomizationArgs: function(stateName, newCustomizationArgs) {
        SimpleEditorShimService.saveCustomizationArgs(
          stateName, newCustomizationArgs);
        data.questionList.getBindableQuestion(
          stateName).setInteractionCustomizationArgs(newCustomizationArgs);
      },
      saveAnswerGroups: function(stateName, newAnswerGroups) {
        SimpleEditorShimService.saveAnswerGroups(stateName, newAnswerGroups);
        data.questionList.getBindableQuestion(
          stateName).setAnswerGroups(newAnswerGroups);
      },
      saveDefaultOutcome: function(stateName, newDefaultOutcome) {
        SimpleEditorShimService.saveDefaultOutcome(
          stateName, newDefaultOutcome);
        data.questionList.getBindableQuestion(
          stateName).setDefaultOutcome(newDefaultOutcome);
      },
      saveBridgeHtml: function(stateName, newHtml) {
        // This is actually the content HTML for the *next* state.
        SimpleEditorShimService.saveBridgeHtml(
          data.questionList.getNextStateName(stateName), newHtml);
        data.questionList.getBindableQuestion(
          stateName).setBridgeHtml(newHtml);
      },
      addNewQuestion: function() {
        // This effectively adds a new multiple-choice interaction to the
        // latest state in the chain.
        var lastStateName = (
          data.questionList.isEmpty() ?
          SimpleEditorShimService.getInitStateName() :
          data.questionList.getLastQuestion().getDestinationStateName());
        SimpleEditorShimService.saveInteractionId(
          lastStateName, 'MultipleChoiceInput');
        SimpleEditorShimService.saveCustomizationArgs(
          lastStateName,
          DEFAULT_INTERACTION_PROPERTIES.MultipleChoiceInput.CUSTOMIZATION_ARGS
        );
        SimpleEditorShimService.saveDefaultOutcome(
          lastStateName, OutcomeObjectFactory.createEmpty(lastStateName));

        var stateData = SimpleEditorShimService.getState(lastStateName);
        data.questionList.addQuestion(QuestionObjectFactory.create(
          lastStateName, stateData.interaction, ''));
      },
      changeQuestion: function(newQuestionType, index) {
        var currentStateName = data.questionList.getAllStateNames()[index];
        var nextStateName = data.questionList.getAllStateNames()[index + 1];
        var questionCount = data.questionList.getQuestionCount();
        var currentInteractionId = (
          SimpleEditorShimService.getInteractionId(currentStateName));
        var doesLastQuestionHaveAnswerGroups = (
          QuestionListObjectFactory.doesLastQuestionHaveAnswerGroups);

        // Update Question Type If interactionId is not same.
        if (newQuestionType !== currentInteractionId) {
          var newAnswerGroups = [];
          SimpleEditorShimService.saveInteractionId(
            currentStateName, newQuestionType);
          SimpleEditorShimService.saveCustomizationArgs(
            currentStateName,
            DEFAULT_INTERACTION_PROPERTIES[newQuestionType].CUSTOMIZATION_ARGS);
          newAnswerGroups.push(AnswerGroupObjectFactory.createNew([
            RuleObjectFactory.createNew(
              DEFAULT_INTERACTION_PROPERTIES[newQuestionType].ANSWER_GROUP.type,
              DEFAULT_INTERACTION_PROPERTIES[newQuestionType].ANSWER_GROUP.value
            )
          ], OutcomeObjectFactory.createEmpty(nextStateName), false));

          if (doesLastQuestionHaveAnswerGroups && index !== questionCount - 1) {
            SimpleEditorShimService.saveAnswerGroups(
              currentStateName, newAnswerGroups);
          }
        }
        // Update the question.
        var questions = StatesToQuestionsService.getQuestions();
        data.questionList.updateQuestion(index, questions[index]);
      },
      canAddNewQuestion: function() {
        // Requirements:
        // - If this is the first question, there must already be an
        //   introduction.
        // - Otherwise, the requirement is that, for the last question in the
        //   list, there is at least one answer group.
        if (data.questionList.isEmpty()) {
          return Boolean(data.introductionHtml);
        } else {
          return data.questionList.getLastQuestion().hasAnswerGroups();
        }
      },
      canTryToFinishExploration: function() {
        return (
          this.canAddNewQuestion() &&
          data.questionList.getQuestionCount() > 2);
      },
      addState: function() {
        var newStateName = getNewStateName();
        SimpleEditorShimService.addState(newStateName);
        SimpleEditorShimService.saveInteractionId(
          newStateName, END_EXPLORATION_INTERACTION.ID);
        SimpleEditorShimService.saveCustomizationArgs(
          newStateName, END_EXPLORATION_INTERACTION.CUSTOMIZATION_ARGS);
        SimpleEditorShimService.saveDefaultOutcome(newStateName, null);
        return newStateName;
      }
    };
  }
]);
