define('ScheduleModel', ['backbone', 'underscore', 'DayModel', 'DayCollection', 'Common'], function (Backbone, _, DayModel, DayCollection, Common) {
  return Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage("ScheduleModel"),

    initialize: function () {
      this.daysCollection = new DayCollection();
      this.daysCollection.on('add', function (model) {
        model.save();
      });
      // todo: on remove?
    },

    initFromJson: function (events) {
      if (!events || !events.length) {
        return;
      }

      function dateWithoutTime(event) {
        return Common.cropTime(event.start).getTime();
      }

      var
        sortedEvents = _(events).sortBy(dateWithoutTime),
        groupedEvents = _(events).groupBy(dateWithoutTime),
        firstDay = this.getFirstDate(sortedEvents),
        lastDay = this.getLastDate(sortedEvents),
        dateIterator = new Date(firstDay.getTime()),
        lastDayTime = lastDay.getTime(),
        days = [];

      while (dateIterator.getTime() <= lastDayTime) {
        days.push(new DayModel({
          events: groupedEvents[dateIterator.getTime()] || [],
          date: new Date(dateIterator.getTime())
        }));
        Common.changeDate(dateIterator, +1);
      }

      this.daysCollection.add(days)
    },

    fetch: function () {
      this.daysCollection.fetch();
      if (this.daysCollection.isEmpty()) {
        console.log('Days collection is empty, performing first load');
        this.initFromJson(Common.lectures || []);
      }
    },

    getFirstDate: function (sortedEvents) {
      var date, event = sortedEvents[0];
      if (event && event.start) {
        date =  event.start;
      } else {
        date = new Date();
      }
      return Common.cropTime(Common.changeDate(date, -2)); // two days back
    },

    getLastDate: function (sortedEvents) {
      var length = sortedEvents.length, date, event = sortedEvents[length - 1];
      if (event && event.start) {
        date =  event.start;
      } else {
        date = new Date();
      }
      return Common.cropTime(Common.changeDate(date, +4)); // four days forward
    }
  });
});