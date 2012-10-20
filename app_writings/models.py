from django.db import models
from django.contrib.auth.models import User

class BaseContent(models.Model):
	title = models.CharField(max_length=200)
	content = models.TextField(blank=True)

	class Meta:
		abstract = True

class Post(BaseContent):
	quote_content = models.TextField(blank=True)
	author = models.CharField(default='Amartya Sengupta', max_length=30)
	url = models.CharField('URL', blank=True, max_length=200)
	published_on = models.DateTimeField(null=True, blank=True)
	
	def __unicode__(self):
		return self.title


#class PostAdmin(admin.ModelAdmin):
#	search_fields = ["title"]
#
#admin.site.register(Post, PostAdmin)