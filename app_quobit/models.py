#app_quobit models

from django.db import models
from django.contrib.auth.models import User

class QEvent(models.Model):
	title = models.CharField(max_length=50)
	created_by = models.CharField(max_length=30)
	created_on = models.DateTimeField(auto_now_add=True, null=True, blank=True)

class QBaseContent(models.Model):
	author = models.CharField(default='Anonymous', max_length=30)
	content = models.TextField(blank=True)
	published_on = models.DateTimeField(auto_now_add=True, null=True, blank=True)

	class Meta:
		abstract = True

class QPost(QBaseContent):
	qevent = models.ForeignKey(QEvent, related_name='posts')

	def __unicode__(self):
		return self.content

class QReply(QBaseContent):
	qpost = models.ForeignKey(QPost, related_name='replies')

	def __unicode__(self):
		return self.content

# class User(models.Model):
# 	username = models.CharField(max_length=30)
# 	email = models.CharField(max_length=50)
# 	password = models.CharField(max_length=40)
# 	created_on = models.DateTimeField(auto_now_add=True, null=True, blank=True)