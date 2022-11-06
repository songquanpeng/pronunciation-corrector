package model

type List struct {
	Id          int    `json:"id"`
	OwnerId     int    `json:"owner_id" gorm:"index"`
	Link        string `json:"link" gorm:"index"`
	Description string `json:"description"`
	Status      int    `json:"status" gorm:"index"` // 0 disabled, 1 private, 2 public
	Words       []byte `json:"words" gorm:"type:blob"`
}

func (list *List) Insert() error {
	var err error
	err = DB.Create(list).Error
	return err
}

func (list *List) Update() error {
	var err error
	err = DB.Model(list).Updates(list).Error
	return err
}

func (list *List) Delete() error {
	var err error
	err = DB.Delete(list).Error
	return err
}
