from django.db import models
from django.contrib.auth.models import User
#from django.db import transaction
from RGT.gridMng.error.userAlreadyParticipating import UserAlreadyParticipating
from RGT.gridMng.error.wrongState import  WrongState
from RGT.gridMng.error.userIsFacilitator import  UserIsFacilitator
from RGT.gridMng.session.state import State as SessionState
from sets import Set
from utility import randomStringGenerator
from datetime import datetime
from django.utils.timezone import utc

#grid manager
class GridManager(models.Manager):
    def duplicateGrid(self, gridObj, userObj= None, gridName= None, gridType= None):
        #create new grid
        newGrid= None
        temp= None
        if userObj:
            if gridName != None:
                newGrid= Grid(user= userObj, description= gridObj.description, name= gridName, dendogram= gridObj.dendogram, grid_type= gridObj.grid_type, usid=randomStringGenerator(20), dateTime=datetime.utcnow().replace(tzinfo=utc))
            else:
                newGrid= Grid(user= userObj, description= gridObj.description, name= gridObj.name, dendogram= gridObj.dendogram, grid_type= gridObj.grid_type, usid=randomStringGenerator(20), dateTime=datetime.utcnow().replace(tzinfo=utc))
        else:
            if gridName != None:
                newGrid= Grid(description= gridObj.description, name= gridName, dendogram= gridObj.dendogram, grid_type= gridObj.grid_type, usid=randomStringGenerator(20), dateTime=datetime.utcnow().replace(tzinfo=utc))
            else:
                newGrid= Grid(description= gridObj.description, name= gridObj.name, dendogram= gridObj.dendogram, grid_type= gridObj.grid_type, usid=randomStringGenerator(20), dateTime=datetime.utcnow().replace(tzinfo=utc))
        if gridType != None:
            newGrid.grid_type= gridType
        if newGrid:
            try:
                newGrid.save()
                newConcerns= []
                newAlternatives= []
                oldConcerns= gridObj.concerns_set.all()
                oldAlternatives= gridObj.alternatives_set.all()
                lenOldConcerns= len(oldConcerns)
                lenOldAlternatives= len(oldAlternatives)
                for concern in oldConcerns:
                    temp= Concerns.objects.create(grid= newGrid, leftPole= concern.leftPole, rightPole= concern.rightPole, weight= concern.weight)
                    newConcerns.append(temp)
                for alternative in oldAlternatives:
                    temp= Alternatives.objects.create(grid= newGrid, name= alternative.name, description= alternative.description)
                    newAlternatives.append(temp)
                i= 0
                j= 0
                while i < lenOldConcerns:
                    while j < lenOldAlternatives:
                        oldRating= Ratings.objects.get(concern= oldConcerns[i], alternative= oldAlternatives[j])
                        Ratings.objects.create(concern= newConcerns[i], alternative= newAlternatives[j], rating= oldRating.rating)
                        j+= 1
                    j= 0
                    i+= 1
                return newGrid
            except:
                #delete what ever we had
                if newGrid:
                    newGrid.delete()
        return False


#grid model
class Grid(models.Model):
    usid= models.CharField(max_length=20, unique=True)
    user= models.ForeignKey(User, null= True)
    name= models.CharField(max_length= 30)
    description= models.TextField(null= True)
    dendogram= models.TextField(null= True)
    dateTime = models.DateTimeField(default=datetime.utcnow().replace(tzinfo=utc),null=True)
    grid_types= ( ('u', 'User grid'), ('s', 'Session grid'), ('ac', 'Response grid, Alternative/Concern'), ('rw','Response grid, Ratings/Weight') )
    grid_type= models.CharField(max_length= 2, choices= grid_types, default= 'u')
    objects= GridManager()

    class Meta:
        ordering= ['id']

    class GridType(object):
        USER_GRID= 'u'
        SESSION_GRID= 's'
        RESPONSE_GRID_ALTERNATIVE_CONCERN= 'ac'
        RESPONSE_GRID_RATING_WEIGHT= 'rw'

        #class Meta:
        #    unique_together= ('user', 'name')

class Alternatives(models.Model):
    grid= models.ForeignKey(Grid)
    name= models.CharField(max_length= 100)
    description= models.TextField(null= True)

    class Meta:
        #unique_together= ('grid', 'name')
        ordering= ['id']

class Concerns(models.Model):
    grid= models.ForeignKey(Grid)
    leftPole= models.CharField(max_length= 150, null= True)
    rightPole= models.CharField(max_length= 150, null= True)
    weight= models.FloatField(null= True)

    class Meta:
        #unique_together= (('grid', 'leftPole', 'rightPole'),)
        ordering= ['id']

class Ratings(models.Model):
    concern= models.ForeignKey(Concerns)
    alternative= models.ForeignKey(Alternatives)
    rating= models.FloatField(null= True)

    class Meta:
        unique_together = ('concern', 'alternative') # they should be primary key but django wouldn't allow composite primary key so to enforce it it somewhat unique is used 

#manager for state
class StateManager(models.Manager):
    def getInitialState(self):
        return  self.get(name= 'initial')

    def getCheckState(self):
        return self.get(name= 'check')

    def getWaitingForAltAndConState(self):
        return self.get(name= 'waitingForAltAndCon')

    def getWaitingForWeightsAndRatingsState(self):
        return self.get(name= 'waitingForWeightsAndRatings')

    def getFinishState(self):
        return self.get(name= 'finish')

#model for state
class State(models.Model):
    name=  models.CharField(max_length= 30)
    objects= StateManager()

    class Meta:
        ordering= ['id']

#manager for facilitator
class FaciliatatorManager(models.Manager):

    def isFacilitator(self, userObj):
        facilitator1= None
        try:
            facilitator1= Facilitator.objects.get(user= userObj)
        except:
            pass
        if facilitator1:
            return facilitator1
        else:
            return False;
#model for facilitator
class Facilitator(models.Model):
    user= models.ForeignKey(User, unique= True)
    objects= FaciliatatorManager()

    class Meta:
        ordering= ['id']

# model of session
class Session(models.Model):
    usid= models.CharField(max_length=20, unique=True)
    facilitator= models.ForeignKey(Facilitator)
    iteration= models.IntegerField(default= 0)
    name= models.CharField(max_length= 30)
    state= models.ForeignKey(State)
    showResult= models.BooleanField(default=False)
    invitationKey= models.TextField(null= True)
    description= models.TextField(null= True)

    class Meta:
        ordering= ['id']

    def getParticipators(self):
        participators= self.userparticipatesession_set.all() #UserParticipateSession.objects.filter(session= self.id)
        users= []
        for participator in participators:
            users.append(participator.user)
        return users

    def addParticipant(self, user1):
        userParticipateSession= self.userparticipatesession_set.filter(user= user1)
        if self.facilitator.user != user1:
            if len(userParticipateSession) <= 0:
                if str(self.state.name) == 'initial':
                    userParticipating= UserParticipateSession(session= self, user= user1)
                    userParticipating.save()
                else:
                    raise WrongState('Can\'t add user in current session state, state:' + self.state.name, sessionState= self.state)
            else:
                raise UserAlreadyParticipating('User already in session' + self.name)
        else:
            raise UserIsFacilitator('User ' + user1.username + 'is already the facilitator in session ' + self.name + ' with session id: ' + str(self.id))

    def changeState(self, state= None):
        if state != None:
            if self.state.name == SessionState.INITIAL:
                # if we are in the initial state the only next state that we can go is the check state
                if state.name == SessionState.CHECK:
                    self.state= state
                    #now lets change the iteration
                    self.__changeIteration__()
                    self.save()
                else:
                    raise WrongState('Current sessions state is ' + self.state.name + ', can\'t go from that state to ' + state.name)
            elif self.state.name == SessionState.CHECK:
                if state.name == SessionState.AC or state.name == SessionState.RW or state.name == SessionState.FINISH:
                    self.state= state
                    self.save()
                else:
                    raise WrongState('Current sessions state is ' + self.state.name + ', can\'t go from that state to ' + state.name)
            elif self.state.name == SessionState.AC:
                sessionIterationStateRelation = SessionIterationState(iteration=self.iteration, session=self, state=self.state)
                sessionIterationStateRelation.save()
                if state.name == SessionState.CHECK:
                    self.state= state
                    #now lets change the iteration
                    self.__changeIteration__()
                    self.save()
                else:
                    raise WrongState('Current sessions state is ' + self.state.name + ', can\'t go from that state to ' + state.name)
            elif self.state.name == SessionState.RW:
                sessionIterationStateRelation = SessionIterationState(iteration=self.iteration, session=self, state=self.state)
                sessionIterationStateRelation.save()
                if state.name == SessionState.CHECK:
                    self.state= state
                    #now lets change the iteration
                    self.__changeIteration__()
                    self.save()
                else:
                    raise WrongState('Current sessions state is ' + self.state.name + ', can\'t go from that state to ' + state.name)
            elif self.state.name == SessionState.FINISH:
                raise WrongState('Session if closed, can\'t change states')
        else:
            raise ValueError('state is None')

    def getUsersThatDidNotRespondedRequest(self):
        repondedUsers= Set(self.getUsersThatRespondedRequest())
        users=  Set(self.getParticipators())
        return users - repondedUsers

    def getUsersThatRespondedRequest(self):
        responseGridRelations= ResponseGrid.objects.filter(session= self, iteration= self.iteration)
        respondedUsers= []
        for relation in responseGridRelations:
            respondedUsers.append({'user':relation.user, 'dateTime':relation.grid.dateTime})
        return respondedUsers


    def __changeIteration__(self):
        sessionGrid1= SessionGrid.objects.filter(session= self, iteration= self.iteration)
        sessionGrid1= sessionGrid1[0].grid
        newSessionGrid= Grid.objects.duplicateGrid(sessionGrid1)
        self.iteration += 1
        sessionGridRelation= SessionGrid(iteration= self.iteration, session= self, grid= newSessionGrid)
        sessionGridRelation.save()

class SessionIterationState(models.Model):
    iteration = models.IntegerField()
    session = models.ForeignKey(Session)
    state= models.ForeignKey(State)

    class Meta:
        unique_together = ('iteration', 'session')
        ordering = ['id']

class UserParticipateSession(models.Model):
    session= models.ForeignKey(Session)
    user= models.ForeignKey(User)

    class Meta:
        unique_together = ('session', 'user') # they should be primary key but django wouldn't allow composite primary key so to enforce it it somewhat unique is used
        ordering= ['id']

#the name of this class in the orm is: iterationHasGridInSession
class SessionGrid(models.Model):
    iteration= models.IntegerField()
    session= models.ForeignKey(Session)
    grid= models.ForeignKey(Grid)

    class Meta:
        unique_together = ('iteration', 'session') # they should be primary key but django wouldn't allow composite primary key so to enforce it it somewhat unique is used
        ordering= ['id']

#the name of this class in the orm is: UserHasGridInIteration
class ResponseGrid(models.Model):
    iteration= models.IntegerField()
    session= models.ForeignKey(Session)
    grid= models.ForeignKey(Grid)
    user= models.ForeignKey(User)

    class Meta:
        unique_together = ('iteration', 'user', 'session') # they should be primary key but django wouldn't allow composite primary key so to enforce it it somewhat unique is used
        ordering= ['id']
    