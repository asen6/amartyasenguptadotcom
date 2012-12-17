#app_quobit views

from django.core.cache import cache
from django.contrib.auth.forms import UserCreationForm
from django.views.generic.simple import direct_to_template
from django.http import HttpResponseRedirect
from django.views.generic.simple import direct_to_template
from django.shortcuts import render_to_response, get_object_or_404

from django.template import Context, loader
from django.http import HttpResponse

from django.utils import simplejson

# import json
# from django.core import serializers
# json_serializer = serializers.get_serializer("json")()

#MEMCACHE_GREETINGS = 'greetings'

import time

from app_quobit.models import QEvent, QPost, QReply


def events(request):
	latest_events_list = QEvent.objects.all().order_by('-created_on')
	return direct_to_template(request, 'app_quobit/events.html',
		{'latest_events_list': latest_events_list})

def create_event(request):
	if request.method == 'POST':
		new_title = request.POST.get('new_event_title')
		new_created_by = request.POST.get('new_event_created_by')

		new_event = QEvent(title=new_title, created_by=new_created_by)
		new_event.save()
		return HttpResponseRedirect("/projects/quobit/")
	else:
		return HttpResponse()


def event(request, event_id):
	return direct_to_template(request, 'app_quobit/event.html')

def register_user(request):
	if request.method == 'POST':
		new_email = request.POST.get('email')
		new_password = request.POST.get('password')
		new_username = request.POST.get('username')

		# search for user in database
		email_matches_list = User.objects.filter(email=new_email)
		if len(email_matches_list) > 0:
			error_code = 1
			items_to_return = {'error_code':error_code}
			return HttpResponse(simplejson.dumps(items_to_return))

		# add user to database
		new_user = User(username=new_username, email=new_email, password=new_password)
		new_user.save()
		error_code = 0
		items_to_return = {'error_code':error_code}
		return HttpResponse(simplejson.dumps(items_to_return))
	else:
		return HttpResponse()

def signin_user(request):
	if request.method == 'POST':
		new_email = request.POST.get('email')
		new_password = request.POST.get('password')
		username = ""

		# search for user in database
		email_matches_list = User.objects.filter(email=new_email)
		if len(email_matches_list) == 0:
			# user wasn't found, so return
			error_code = 1
			items_to_return = {'error_code':error_code}
			return HttpResponse(simplejson.dumps(items_to_return))

		# check if password matches
		error_code = 2
		items_to_return = {'error_code':error_code}
		for user in email_matches_list:
			if user.password == new_password:
				error_code = 0
				username = user.username
				items_to_return = {'error_code':error_code, 'username': username}

		return HttpResponse(simplejson.dumps(items_to_return))
	else:
		return HttpResponse()

def enter_qpost(request):
	if request.method == 'POST':
		event_id = request.POST.get('event_id')
		selected_event = get_object_or_404(QEvent, id=event_id)
		username = request.POST.get('username')
		text = request.POST.get('new_qpost_text')
		qpost = QPost(qevent=selected_event, author=username, content=text)
		qpost.save()
		qpost_id = qpost.id
		items_to_return = {'qpost_id': qpost_id}
		return HttpResponse(simplejson.dumps(items_to_return))
	else:
		return HttpResponse()

def enter_qreply(request):
	if request.method == 'POST':
		qpost_id = request.POST.get('qpost_id')
		username = request.POST.get('username')
		text = request.POST['new_qreply_text']
		selected_qpost = get_object_or_404(QPost, id=qpost_id)
		qreply = QReply(author=username, content=text, qpost=selected_qpost)
		qreply_id = qreply.id
		qreply.save()
		items_to_return = {'qreply_id': qreply_id}
		return HttpResponse(simplejson.dumps(items_to_return))
	else: 
		return HttpResponse()


def get_all_qposts_and_qreplies(request):
	event_id = int(request.GET.get('event_id'))
	current_chat_id = request.GET.get('current_chat_id')
	last_qreply_id = int(request.GET.get('last_qreply_id'))

	latest_qposts_list = QPost.objects.all().filter(qevent__id=event_id).order_by('published_on')
	latest_qreplies_list = QReply.objects.filter(qpost__id=current_chat_id).order_by('published_on')

	qposts = []
	qreplies = []

	for curr_qpost in latest_qposts_list:
		curr_qpost_dict = {'qpost_id': curr_qpost.id,
							'author': curr_qpost.author, 
							'content': curr_qpost.content,
							'published_on': time.mktime(curr_qpost.published_on.timetuple())
							}
		qposts.append(curr_qpost_dict)

	for curr_qreply in latest_qreplies_list:
		if curr_qreply.id > last_qreply_id:
			curr_qreply_dict = {'qpost_id': curr_qreply.qpost.id,
								'qreply_id': curr_qreply.id,
								'author': curr_qreply.author, 
								'content': curr_qreply.content,
								'published_on': time.mktime(curr_qreply.published_on.timetuple())
								}
			qreplies.append(curr_qreply_dict)

	items_to_return = {'qposts': qposts, 'qreplies': qreplies}

	return HttpResponse(simplejson.dumps(items_to_return))


def channel(request):
	return direct_to_template(request, 'app_quobit/channel.html')







	# latest_qposts_list = QPost.objects.all().order_by('-published_on')
	# latest_qreplies_list = QReply.objects.all().order_by('published_on')

	# items_to_return = [{'latest_qposts_list': latest_qposts_list}, {'latest_qreplies_list': latest_qreplies_list}]
	# #return json.dumps(latest_qposts_list, latest_qreplies_list)
	
	# latest_qpost = QPost.objects.all().order_by('-published_on')[0]
	# #return HttpResponse(json_serializer.serialize(items_to_return, ensure_ascii=False))
	# return HttpResponse(json_serializer.serialize(QPost.objects.all(), ensure_ascii=False))
	# #return json.dumps(latest_qpost)

	# #please_work = 10
	# #return HttpResponse(json.dumps({'a': please_work}))

	# #stuff_to_return = json.dumps(['foo', {'bar': ('baz', None, 1.0, 2)}])
	# #return stuff_to_return_2

	# #return































