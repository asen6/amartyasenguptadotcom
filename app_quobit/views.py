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

from app_quobit.models import QEvent, QPost, QReply, User


def events(request):
	latest_events_list = QEvent.objects.all().order_by('-created_on')
	return direct_to_template(request, 'app_quobit/events.html',
		{'latest_events_list': latest_events_list})

def create_event(request):
	if request.method == 'POST':
		new_title = request.POST.get('new_event_title')
		new_user_id = int(request.session['user_id'])
		selected_user = get_object_or_404(User, id=new_user_id)
		user_id = selected_user.id
		fbid = selected_user.fbid
		username = selected_user.username

		new_event = QEvent(title=new_title, created_by_user_id=user_id, created_by_fbid=fbid, created_by_username=username)
		new_event.save()
		return HttpResponseRedirect("/projects/quobit/")
	else:
		return HttpResponse()


def event(request, event_id):
	qevent = get_object_or_404(QEvent, id=int(event_id))
	return direct_to_template(request, 'app_quobit/event.html',
								{'qevent': qevent})

def set_user(request):
	if request.method == 'POST':

		new_fbid = request.POST.get('fbid')
		new_username = request.POST.get('username')
		new_email = request.POST.get('email')

		return_code = 0

		# check if user already exists.  If not, register.
		fbid_matches_list = User.objects.filter(fbid=new_fbid)
		if len(fbid_matches_list) > 1:
			return_code = 1
			items_to_return = {'return_code':return_code}
			return HttpResponse(simplejson.dumps(items_to_return))
		elif len(fbid_matches_list) == 0:
			# user not found.  register and get user info
			return_code = 2
			new_user = User(fbid=new_fbid, username=new_username, email=new_email)
			new_user.save()
			fbid_matches_list = User.objects.filter(fbid=new_fbid)

		user_id = fbid_matches_list[0].id
		username = fbid_matches_list[0].username

		# set cookie
		request.session['user_id'] = user_id
		request.session['username'] = username

		# return user id and username
		items_to_return = {'return_code':return_code, 'user_id':user_id, 'username':username}
		return HttpResponse(simplejson.dumps(items_to_return))
	else:
		return HttpResponse()

def enter_qpost(request):
	if request.method == 'POST':
		event_id = int(request.POST.get('event_id'))
		# user_id = request.POST.get('user_id')
		user_id = int(request.session['user_id'])
		selected_event = get_object_or_404(QEvent, id=event_id)
		selected_user = get_object_or_404(User, id=user_id)
		text = request.POST.get('new_qpost_text')

		qpost = QPost(qevent=selected_event, user_id=selected_user.id, fbid=selected_user.fbid, username=selected_user.username, content=text)
		qpost.save()
		qpost_id = qpost.id
		
		items_to_return = {'qpost_id': qpost_id, 'username': selected_user.username}
		return HttpResponse(simplejson.dumps(items_to_return))
	else:
		return HttpResponse()

def enter_qreply(request):
	if request.method == 'POST':
		qpost_id = int(request.POST.get('qpost_id'))
		user_id = int(request.session['user_id'])
		text = request.POST['new_qreply_text']
		selected_qpost = get_object_or_404(QPost, id=qpost_id)
		selected_user = get_object_or_404(User, id=user_id)

		qreply = QReply(qpost=selected_qpost, user_id=selected_user.id, fbid=selected_user.fbid, username=selected_user.username, content=text)
		qreply.save()
		qreply_id = qreply.id

		items_to_return = {'qreply_id': qreply_id, 'username': selected_user.username}
		return HttpResponse(simplejson.dumps(items_to_return))
	else: 
		return HttpResponse()


def get_all_qposts_and_qreplies(request):
	event_id = int(request.GET.get('event_id'))
	current_chat_id = int(request.GET.get('current_chat_id'))
	last_qreply_id = int(request.GET.get('last_qreply_id'))

	latest_qposts_list = QPost.objects.all().filter(qevent__id=event_id).order_by('published_on')
	latest_qreplies_list = QReply.objects.filter(qpost__id=current_chat_id).order_by('published_on')

	qposts = []
	qreplies = []

	for curr_qpost in latest_qposts_list:
		curr_qpost_dict = {'qpost_id': curr_qpost.id,
							'author': curr_qpost.username,
							'content': curr_qpost.content,
							'published_on': time.mktime(curr_qpost.published_on.timetuple())
							}
		qposts.append(curr_qpost_dict)

	for curr_qreply in latest_qreplies_list:
		if curr_qreply.id > last_qreply_id:
			curr_qreply_dict = {'qpost_id': curr_qreply.qpost.id,
								'qreply_id': curr_qreply.id,
								'author': curr_qreply.username, 
								'content': curr_qreply.content,
								'published_on': time.mktime(curr_qreply.published_on.timetuple())
								}
			qreplies.append(curr_qreply_dict)

	user_id = int(request.session['user_id'])
	user = get_object_or_404(User, id=user_id)
	user_dict = {'user_id':user.id, 'username':user.username, 'fbid':user.fbid}

	items_to_return = {'qposts': qposts, 'qreplies': qreplies, 'user': user_dict}

	return HttpResponse(simplejson.dumps(items_to_return))


def channel(request):
	return direct_to_template(request, 'app_quobit/channel.html')




