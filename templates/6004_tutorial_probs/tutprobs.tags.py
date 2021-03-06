from xtutor.taglib import *

class tag_questions(XMLTag):
    # Here's where the initial setup goes:
    def pre_layout(self):
        # Put in a question counter.  This gets incremented by each
        # question, during layout:
        self.number_of_questions = 0

    # Allocate the next question, return its question number (string):
    # Called during layout by child 'question' nodes.
    def new_question(self):
        self.number_of_questions += 1
        return self.number_of_questions

    def render_noscript(self,options):
        if options['args'].has_key('answers') or options['args'].has_key('noanswers'):
            return ''
        return noscript()[
            table(width="100%",border="1",cellpadding="8",bgcolor="yellow")[tr()[td()[
            """You need to have Javascript enabled to view this page
            properly.  If your browser does not support Javascript
            or you have chosen not to enable it, please return to
            the previous page and use the appropriate link to view
            PDF versions of this tutorial page."""]]]]

    def render_top_buttons(self,options):
        if options['args'].has_key('answers') or options['args'].has_key('noanswers'):
            return ''
        return [
            a(href="#",onClick="showall(); return false")[img(border="0",src="showall.gif")],
            xml("&nbsp;"),
            a(href="#",onClick="hideall(); return false")[img(border="0",src="hideall.gif")],
            ]

    def generate_html(self, options):
        return html()[
            head()[script(language="JavaScript1.2",src="tutprobs.js")],
            body()[
              self.render_noscript(options),
              div(id="start",_class="question")[
                self.render_top_buttons(options),
                p()[font(size="5")[b()[self['title']]]],
                p()[img(src="star.gif",alt="Discussed in section"),
                    "indicates problems that have been selected for discussion in section, time permitting."
                    ]
                ],
              self.generate_html_from_elements(options)
            ]
            ]

class tag_question(XMLTag):
    def pre_layout(self):
        qnode = self.find_parent_tag((self.ns, 'questions'))
        self.question_number = qnode.new_question()
        self.number_of_subquestions = 0

    # Allocate the next subquestion, return its question number as
    #   a tuple: (question#, subquestion#)
    # Called during layout by child 'question' nodes.
    def new_subquestion(self):
        self.number_of_subquestions += 1
        return (self.question_number, self.number_of_subquestions)

    def generate_html(self, options):
        return div(id="question%d" % self.question_number,_class="question")[
            p(),hr(),p(),u()["Problem ",self.question_number,"."],
            self.generate_html_from_elements(options)
            ]

class tag_subquestion(XMLTag):
    def pre_layout(self):
        qnode = self.find_parent_tag((self.ns, 'question'))
        self.question_number, self.subquestion_number,  = qnode.new_subquestion()

    def generate_html(self, options):
        num = "%d%c" % (self.question_number,chr(ord('@')+self.subquestion_number))
        return div(id="question"+num,_class="question")[
            ol(type="A",start=self.subquestion_number)[
              li()[self.generate_html_from_elements(options)]
            ]
            ]

class tag_answer(XMLTag):
    def pre_layout(self):
        qnode = self.find_parent_tag((self.ns, 'subquestion'))
        self.question_number = qnode.question_number
        self.subquestion_number  = qnode.subquestion_number

    def render_button(self,options,num):
        if options['args'].has_key('answers') or options['args'].has_key('noanswers'):
            return ''
        return div(id="control"+num,_class="control",style="padding-top: 8px; padding-bottom: 8px")[
            a(href="#",onClick="toggle('%s'); return false" % num)[
              img(name="ctl"+num,_class="hideshow",src="show.gif",border="0")
            ]]

    def render_answer(self,options,num):
        if options['args'].has_key('noanswers'):
            return ''
        if options['args'].has_key('answers'):
            display = "display:block"
            spacer = p()
        else:
            display = "display:none"
            spacer = ''
        return div(id="answer"+num,_class="answer",style=display)[
            font(color="blue")[spacer,self.generate_html_from_elements(options)]
            ]

    def generate_html(self, options):
        num = "%d%c" % (self.question_number,chr(ord('@')+self.subquestion_number))
        
        return [self.render_button(options,num), self.render_answer(options,num)]

###
# Set the list of tags this module provides to be all 
###
tags = dict([(name[4:], value)
             for name,value in globals().items()
             if name.startswith('tag_')])
