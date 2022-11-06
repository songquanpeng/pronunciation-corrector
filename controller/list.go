package controller

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"pronunciation-corrector/model"
)

func GetAvailableList(c *gin.Context) {
	userId := c.GetInt("id")
	lists, err := model.GetAvailableLists(userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    lists,
	})
	return
}
